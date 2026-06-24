import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDiscoveryStore } from './useDiscoveryStore';
import { useExploreFilterStore } from './useExploreFilterStore';
import { FlatItem } from '../../components/explore/ExploreListItem';

const DISCOVERY_LIMIT = 2;

export function useExploreFlatData(): FlatItem[] {
    const discovery = useDiscoveryStore();
    const filters = useExploreFilterStore();
    const { t } = useTranslation();

    const flatData = useMemo(() => {
        const data: FlatItem[] = [];

        if (filters.isFilterModeActive) {
            data.push({ kind: 'section_header', title: t('explore.sections.searchResults'), key: 'header_search' });

            if (filters.filteredTravels && filters.filteredTravels.length > 0) {
                filters.filteredTravels.forEach((travelItem) => {
                    data.push({ kind: 'travel', travel: travelItem, key: 'search_' + travelItem.id });
                });
            } else if (!filters.isSearching) {
                data.push({ kind: 'empty', message: t('explore.sections.noResults'), key: 'empty_search' });
            }

            if (filters.isSearching && filters.filteredTravels.length === 0) {
                data.push({ kind: 'loader', key: 'loader_search_initial' });
            }

            return data;
        }

        // Seccion "Descubrir"
        data.push({ kind: 'section_header', title: t('explore.sections.discover'), key: 'header_discovery' });

        const discoveryTravels = discovery.publicTravels?.slice(0, DISCOVERY_LIMIT) ?? [];

        discoveryTravels.forEach((travelItem) => {
            data.push({ kind: 'travel', travel: travelItem, key: 'public_' + travelItem.id });
        });

        if (discovery.isLoading) {
            data.push({ kind: 'loader', key: 'loader_discovery' });
        }

        //Seccion "Seguidos"
        data.push({ kind: 'section_header', title: t('explore.sections.following'), key: 'header_following' });

        if (discovery.followingTravels && discovery.followingTravels.length > 0) {
            discovery.followingTravels.forEach((travelItem) => {
                data.push({ kind: 'travel', travel: travelItem, key: 'following_' + travelItem.id });
            });
        }

        if (discovery.isLoadingMoreFollowing) {
            data.push({ kind: 'loader', key: 'loader_following_more' });
        }

        return data;
    }, [
        filters.isFilterModeActive,
        filters.filteredTravels,
        filters.isSearching,
        discovery.publicTravels,
        discovery.isLoading,
        discovery.followingTravels,
        discovery.isLoadingMoreFollowing,
        t
    ]);

    return flatData;
}