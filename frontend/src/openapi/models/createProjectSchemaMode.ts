/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * A mode of the project affecting what actions are possible in this project
 */
export type CreateProjectSchemaMode =
    typeof CreateProjectSchemaMode[keyof typeof CreateProjectSchemaMode];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateProjectSchemaMode = {
    open: 'open',
    protected: 'protected',
    private: 'private',
} as const;
