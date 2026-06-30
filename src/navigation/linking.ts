import { LinkingOptions } from "@react-navigation/native";

export const linking: LinkingOptions<any> = {
    prefixes: ["bitacorahybrid://"],
    config: {
        screens: {
            Tabs: {
                screens: {},
            },
            Travel: {
                screens: {
                    TravelDetails: "travel/:travelId",
                    PoiDetail: "travel/:travelId/poi/:pointId",
                },
            },
        },
    },
};