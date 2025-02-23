/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    AccessService,
    AccessWithRoles,
} from '../../lib/services/access-service';
import User from '../../lib/types/user';
import noLoggerProvider from './no-logger';
import { IRole } from '../../lib/types/stores/access-store';
import { IAvailablePermissions } from '../../lib/types/model';

class AccessServiceMock extends AccessService {
    constructor() {
        super(
            {
                accessStore: undefined,
                accountStore: undefined,
                roleStore: undefined,
                environmentStore: undefined,
                groupStore: undefined,
            },
            { getLogger: noLoggerProvider, flagResolver: undefined },
            undefined,
        );
    }

    hasPermission(
        user: User,
        permission: string,
        projectId?: string,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getPermissions(): Promise<IAvailablePermissions> {
        throw new Error('Method not implemented.');
    }

    addUserToRole(userId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setUserRootRole(userId: number, roleId: number): Promise<void> {
        return Promise.resolve();
    }

    addPermissionToRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getRolesForProject(projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getRolesForUser(userId: number): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getUsersForRole(roleId: any): Promise<User[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoleAccess(projectId: string): Promise<AccessWithRoles> {
        throw new Error('Method not implemented.');
    }

    createDefaultProjectRoles(owner: User, projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeDefaultProjectRoles(owner: User, projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

export default AccessServiceMock;
