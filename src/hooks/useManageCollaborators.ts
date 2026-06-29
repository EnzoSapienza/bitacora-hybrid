import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { travelService } from '../services/firestore/travelService';
import { userService } from '../services/firestore/userService';
import { useAuthStore } from '../store/authStore';
import { useTravelStore } from './firestore/useTravelStore';

export interface CollaboratorUser {
    id: string;
    username?: string;
    displayName?: string;
    photoURL?: string;
    [key: string]: any;
}

export function useManageCollaborators(tripId: string) {
    const currentUser = useAuthStore((s) => s.user);
    const { t } = useTranslation();
    const updateTravelPrivileges = useTravelStore((s) => s.updateTravelPrivileges);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
    const [initialCollaboratorIds, setInitialCollaboratorIds] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CollaboratorUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Carga inicial: trip -> privileges -> users completos
    useEffect(() => {
        let active = true;
        (async () => {
            setIsLoading(true);
            try {
                const trip = await travelService.getById(tripId);
                if (!trip) throw new Error(t('collaborators.errors.notFound'));
                const privileges: string[] = trip.privileges ?? [];
                const users = await userService.getUsersByIds(privileges);
                if (!active) return;
                setOwnerId(trip.ownerId);
                setCollaborators(users );
                setInitialCollaboratorIds(privileges);
            } catch (e: any) {
                if (active) setError(e.message ?? t('collaborators.errors.loadFailed'));
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false; };
    }, [tripId, t]);
    
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (searchQuery.trim().length < 3) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await userService.searchUsers(searchQuery);
                const collaboratorIds = collaborators.map((c) => c.id);
                const filtered = results.filter(
                    (u: CollaboratorUser) => u.id !== ownerId && !collaboratorIds.includes(u.id)
                );
                setSearchResults(filtered);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, collaborators, ownerId]);

    const addCollaborator = useCallback((user: CollaboratorUser) => {
        setCollaborators((prev) => [...prev, user]);
        setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
        setSearchQuery('');
    }, []);

    const removeCollaborator = useCallback((userId: string) => {
        setCollaborators((prev) => prev.filter((u) => u.id !== userId));
    }, []);

    const savePrivileges = useCallback(async () => {
        if (!currentUser?.uid || currentUser.uid !== ownerId) {
            setError(t('collaborators.errors.notOwner'));
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const newIds = collaborators.map((c) => c.id);
            const removed = initialCollaboratorIds.filter((id) => !newIds.includes(id));

            await travelService.update(tripId, { privileges: newIds });
            await travelService.syncTripAccess(tripId, newIds, removed);

            updateTravelPrivileges(tripId, newIds);
            setInitialCollaboratorIds(newIds);
            setSuccess(true);
        } catch (e: any) {
            setError(e.message ?? t('collaborators.errors.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    }, [tripId, collaborators, initialCollaboratorIds, currentUser, ownerId, t, updateTravelPrivileges]);

    return {
        isLoading, isSaving, error, success,
        collaborators, searchQuery, setSearchQuery,
        searchResults, isSearching,
        addCollaborator, removeCollaborator, savePrivileges,
        clearError: () => setError(null),
    };
}