import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { FeatureSearchQueryParameters } from '../../openapi/spec/feature-search-query-parameters';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_search', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    featureSearchAPI: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

const searchFeatures = async (
    { query = '', projectId = 'default' }: FeatureSearchQueryParameters,
    expectedCode = 200,
) => {
    return app.request
        .get(`/api/admin/search/features?query=${query}&projectId=${projectId}`)
        .expect(expectedCode);
};

const sortFeatures = async (
    {
        sortBy = '',
        sortOrder = '',
        projectId = 'default',
    }: FeatureSearchQueryParameters,
    expectedCode = 200,
) => {
    return app.request
        .get(
            `/api/admin/search/features?sortBy=${sortBy}&sortOrder=${sortOrder}&projectId=${projectId}`,
        )
        .expect(expectedCode);
};

const searchFeaturesWithCursor = async (
    {
        query = '',
        projectId = 'default',
        cursor = '',
        limit = '10',
    }: FeatureSearchQueryParameters,
    expectedCode = 200,
) => {
    return app.request
        .get(
            `/api/admin/search/features?query=${query}&projectId=${projectId}&cursor=${cursor}&limit=${limit}`,
        )
        .expect(expectedCode);
};

const getPage = async (url: string, expectedCode = 200) => {
    return app.request.get(url).expect(expectedCode);
};

const filterFeaturesByType = async (types: string[], expectedCode = 200) => {
    const typeParams = types.map((type) => `type[]=${type}`).join('&');
    return app.request
        .get(`/api/admin/search/features?${typeParams}`)
        .expect(expectedCode);
};

const filterFeaturesByTag = async (tags: string[], expectedCode = 200) => {
    const tagParams = tags.map((tag) => `tag[]=${tag}`).join('&');
    return app.request
        .get(`/api/admin/search/features?${tagParams}`)
        .expect(expectedCode);
};

const filterFeaturesByEnvironmentStatus = async (
    environmentStatuses: string[],
    expectedCode = 200,
) => {
    const statuses = environmentStatuses
        .map((status) => `status[]=${status}`)
        .join('&');
    return app.request
        .get(`/api/admin/search/features?${statuses}`)
        .expect(expectedCode);
};

const searchFeaturesWithoutQueryParams = async (expectedCode = 200) => {
    return app.request.get(`/api/admin/search/features`).expect(expectedCode);
};

test('should search matching features by name', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feat_c');

    const { body } = await searchFeatures({ query: 'feature' });

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
        total: 2,
    });
});

test('should paginate with cursor', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_d');

    const { body: firstPage, headers: firstHeaders } =
        await searchFeaturesWithCursor({
            query: 'feature',
            cursor: '',
            limit: '2',
        });

    expect(firstPage).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
        total: 4,
    });

    const { body: secondPage, headers: secondHeaders } = await getPage(
        firstHeaders.link,
    );

    expect(secondPage).toMatchObject({
        features: [{ name: 'my_feature_c' }, { name: 'my_feature_d' }],
        total: 4,
    });

    expect(secondHeaders.link).toBe('');
});

test('should filter features by type', async () => {
    await app.createFeature({ name: 'my_feature_a', type: 'release' });
    await app.createFeature({ name: 'my_feature_b', type: 'experimental' });

    const { body } = await filterFeaturesByType([
        'experimental',
        'kill-switch',
    ]);

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_b' }],
    });
});

test('should filter features by tag', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.addTag('my_feature_a', { type: 'simple', value: 'my_tag' });

    const { body } = await filterFeaturesByTag(['simple:my_tag']);

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('should filter features by environment status', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.enableFeature('my_feature_a', 'default');

    const { body } = await filterFeaturesByEnvironmentStatus([
        'default:enabled',
        'nonexistentEnv:disabled',
        'default:wrongStatus',
    ]);

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('filter with invalid tag should ignore filter', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.addTag('my_feature_a', { type: 'simple', value: 'my_tag' });

    const { body } = await filterFeaturesByTag(['simple']);

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
    });
});

test('should search matching features by tag', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.addTag('my_feature_a', { type: 'simple', value: 'my_tag' });

    const { body: fullMatch } = await searchFeatures({
        query: 'simple:my_tag',
    });
    const { body: tagTypeMatch } = await searchFeatures({ query: 'simple' });
    const { body: tagValueMatch } = await searchFeatures({ query: 'my_tag' });
    const { body: partialTagMatch } = await searchFeatures({ query: 'e:m' });

    expect(fullMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
    expect(tagTypeMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
    expect(tagValueMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
    expect(partialTagMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('should return empty features', async () => {
    const { body } = await searchFeatures({ query: '' });
    expect(body).toMatchObject({ features: [] });
});

test('should not search features from another project', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');

    const { body } = await searchFeatures({
        query: '',
        projectId: 'another_project',
    });

    expect(body).toMatchObject({ features: [] });
});

test('should return features without query', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');

    const { body } = await searchFeaturesWithoutQueryParams();

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
    });
});

test('should sort features', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_b');
    await app.enableFeature('my_feature_c', 'default');

    const { body: ascName } = await sortFeatures({
        sortBy: 'name',
        sortOrder: 'asc',
    });

    expect(ascName).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
        total: 3,
    });

    const { body: descName } = await sortFeatures({
        sortBy: 'name',
        sortOrder: 'desc',
    });

    expect(descName).toMatchObject({
        features: [
            { name: 'my_feature_c' },
            { name: 'my_feature_b' },
            { name: 'my_feature_a' },
        ],
        total: 3,
    });

    const { body: defaultCreatedAt } = await sortFeatures({
        sortBy: '',
        sortOrder: '',
    });

    expect(defaultCreatedAt).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_c' },
            { name: 'my_feature_b' },
        ],
        total: 3,
    });

    const { body: environmentAscSort } = await sortFeatures({
        sortBy: 'environment:default',
        sortOrder: 'asc',
    });

    expect(environmentAscSort).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
        total: 3,
    });

    const { body: environmentDescSort } = await sortFeatures({
        sortBy: 'environment:default',
        sortOrder: 'desc',
    });

    expect(environmentDescSort).toMatchObject({
        features: [
            { name: 'my_feature_c' },
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
        ],
        total: 3,
    });
});
