import config from '../globalConfig'

export function convertToCurrentVersion(query) {
    if (query === undefined || query.version === undefined) return undefined;
    if (query.version === config.version) return query;

    switch (query.version) {
        // Convert query into current version and return here
        default:
            return undefined;
    }
}