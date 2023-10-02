/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { FeatureEnvironmentSchema } from './featureEnvironmentSchema';
import type { VariantSchema } from './variantSchema';
import type { FeatureSchemaStrategiesItem } from './featureSchemaStrategiesItem';
import type { TagSchema } from './tagSchema';

/**
 * A feature toggle definition
 */
export interface FeatureSchema {
    /** Unique feature name */
    name: string;
    /** Type of the toggle e.g. experiment, kill-switch, release, operational, permission */
    type?: string;
    /** Detailed description of the feature */
    description?: string | null;
    /** `true` if the feature is archived */
    archived?: boolean;
    /** Name of the project the feature belongs to */
    project?: string;
    /** `true` if the feature is enabled, otherwise `false`. */
    enabled?: boolean;
    /** `true` if the feature is stale based on the age and feature type, otherwise `false`. */
    stale?: boolean;
    /** `true` if the feature was favorited, otherwise `false`. */
    favorite?: boolean;
    /** `true` if the impression data collection is enabled for the feature, otherwise `false`. */
    impressionData?: boolean;
    /** The date the feature was created */
    createdAt?: string | null;
    /** The date the feature was archived */
    archivedAt?: string | null;
    /**
     * The date when metrics where last collected for the feature. This field is deprecated, use the one in featureEnvironmentSchema
     * @deprecated
     */
    lastSeenAt?: string | null;
    /** The list of environments where the feature can be used */
    environments?: FeatureEnvironmentSchema[];
    /**
     * The list of feature variants
     * @deprecated
     */
    variants?: VariantSchema[];
    /**
     * This is a legacy field that will be deprecated
     * @deprecated
     */
    strategies?: FeatureSchemaStrategiesItem[];
    /** The list of feature tags */
    tags?: TagSchema[] | null;
}
