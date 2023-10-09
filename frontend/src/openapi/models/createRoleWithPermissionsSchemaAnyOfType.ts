/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * [Custom root roles](https://docs.getunleash.io/reference/rbac#custom-root-roles) (type=root-custom) are root roles with a custom set of permissions. [Custom project roles](https://docs.getunleash.io/reference/rbac#custom-project-roles) (type=custom) contain a specific set of permissions for project resources.
 */
export type CreateRoleWithPermissionsSchemaAnyOfType =
    typeof CreateRoleWithPermissionsSchemaAnyOfType[keyof typeof CreateRoleWithPermissionsSchemaAnyOfType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateRoleWithPermissionsSchemaAnyOfType = {
    'root-custom': 'root-custom',
    custom: 'custom',
} as const;
