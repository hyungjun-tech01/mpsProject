import { Pool } from "pg";
import * as User from "./fetchUserData";
import * as Group from "./fetchGroupData";
import * as Device from "./fetchDeviceData";
import * as Document from "./fetchDocumentData";
import * as Log from "./fetchLogData";
import type { UserState } from "./actions";
import * as Action from "./actions";
import type { GroupState } from "./actionsGroup";
import * as GroupAction from "./actionsGroup";


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS,
});


export default function MyDBAdapter() {
    return {
        // ----- User ------------------------------------------
        async getFilteredUsers(
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return User.fetchFilteredUsers(pool, query, itemsPerPage, currentPage);
        },
        async getFilteredUsersPages(query: string, itemsPerPage: number) {
            return User.fetchUsersPages(pool, query, itemsPerPage);
        },
        async getAllUsers() {
            return User.fetchAllUsers(pool);
        },
        async getUserById(id: string) {
            return User.fetchUserById(pool, id);
        },
        async getUserByName(name: string) {
            return User.fetchUserByName(pool, name);
        },
        async getUserCount() {
            return User.fetchUserCount(pool);
        },
        async createUser(prevState: UserState, formData: FormData) {
            'use server';
            return Action.createUser(pool, prevState, formData);
        },
        async modifyUser(id: string, prevState: UserState, formData: FormData) {
            'use server';
            return Action.modifyUser(pool, id, prevState, formData);
        },
        async deleteUser(userId: string) {
            'use server';
            return Action.deleteUser(pool, userId)
        },
        async getAccount(userName: string) {
            return User.fetchAccount(pool, userName)
        },
        async updateAccount(id: string, prevState: UserState, formData: FormData) {
            'use server';
            return Action.updateAccount(pool, id, prevState, formData);
        },
        async changeBalance(id: string, prevState: UserState, formData: FormData) {
            'use server';
            return Action.changeBalance(pool, id, prevState, formData);
        },

        // ----- Group ------------------------------------------
        async getFilteredGroups(
            query: string,
            groupType: string,
            itemsPerPage: number,
            currentPage: number,
            locale: string
        ) {
            return Group.fetchFilteredGroups(pool, query, groupType, itemsPerPage, currentPage, locale);
        },
        async getFilteredGroupsPages(
            query: string,
            groupType: string,
            itemsPerPage: number,
        ) {
            return Group.fetchFilteredGroupsPages(pool, query, groupType, itemsPerPage);
        },
        async getGroupsByType(
            groupType: string,
        ) {
            return Group.fetchGroupsByType(pool, groupType);
        },
        async getGroupInfoById(
            groupId: string,
            groupType: string
        ) {
            return Group.fetchGroupInfoById(pool, groupId, groupType);
        },
        async getUsersNotInGroup(
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Group.fetchUsersNotInGroup(pool, query, itemsPerPage, currentPage);
        },
        async getUsersNotInGroupPages(
            query: string,
            itemsPerPage: number
        ) {
            return Group.fetchUsersNotInGroupPages(pool, query, itemsPerPage);
        },
        async getUsersInGroup(
            id: string,
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Group.fetchUsersInGroup(pool, id, query, itemsPerPage, currentPage);
        },
        async getUsersInGroupPages(
            id: string,
            query: string,
            itemsPerPage: number
        ) {
            return Group.fetchUsersInGroupPages(pool, id, query, itemsPerPage);
        },
        async getDevicesNotInGroup(
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Group.fetchDevicesNotInGroup(pool, query, itemsPerPage, currentPage);
        },
        async getDevicesNotInGroupPages(
            query: string,
            itemsPerPage: number
        ) {
            return Group.fetchDevicesNotInGroupPages(pool, query, itemsPerPage);
        },
        async getDevicesInGroup(
            id: string,
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Group.fetchDevicesInGroup(pool, id, query, itemsPerPage, currentPage);
        },
        async getDevicesInGroupPages(
            id: string,
            query: string,
            itemsPerPage: number
        ) {
            return Group.fetchDevicesInGroupPages(pool, id, query, itemsPerPage);
        },
        async getDeptsNotInGroup(
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Group.fetchDeptsNotInGroup(pool, query, itemsPerPage, currentPage);
        },
        async getDeptsNotInGroupPages(
            query: string,
            itemsPerPage: number
        ) {
            return Group.fetchDeptsNotInGroupPages(pool, query, itemsPerPage);
        },
        async getDeptsInGroup(
            id: string,
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Group.fetchDeptsInGroup(pool, id, query, itemsPerPage, currentPage);
        },
        async getDeptsInGroupPages(
            id: string,
            query: string,
            itemsPerPage: number
        ) {
            return Group.fetchDeptsInGroupPages(pool, id, query, itemsPerPage);
        },
        async createDeviceGroup(prevState: GroupState, formData: FormData) {
            'use server';
            return GroupAction.createDeviceGroup(pool, prevState, formData);
        },
        async modifyDeviceGroup(id: string, prevState: GroupState, formData: FormData) {
            'use server';
            return GroupAction.modifyDeviceGroup(pool, id, prevState, formData);
        },
        async createUserGroup(prevState: GroupState, formData: FormData) {
            'use server';
            return GroupAction.createUserGroup(pool, prevState, formData);
        },
        async modifyUserGroup(id: string, prevState: GroupState, formData: FormData) {
            'use server';
            return GroupAction.modifyUserGroup(pool, id, prevState, formData);
        },
        async createSecurityGroup(prevState: GroupState, formData: FormData) {
            'use server';
            return GroupAction.createUserGroup(pool, prevState, formData);
        },
        async modifySecurityGroup(id: string, prevState: GroupState, formData: FormData) {
            'use server';
            return GroupAction.modifyUserGroup(pool, id, prevState, formData);
        },
        async deleteGroup(id: string) {
            'use server';
            return GroupAction.deleteGroup(pool, id);
        },

        // ----- Device --------------------------------------------
        async getFilteredDevices(
            loginName: string | undefined,
            query: string,
            itemsPerPage: number,
            currentPage: number,
            groupId?: string
        ){
            return Device.fetchFilteredDevices(loginName, query, itemsPerPage, currentPage, groupId);
        },
        async getLatestDeviceStatus() {
            try {
                const response = await pool.query(`
                    SELECT
                        printer_id,
                        hardware_check_status
                    FROM (
                        SELECT
                            p.printer_id,
                            pul.hardware_check_status,
                            ROW_NUMBER() OVER (PARTITION BY p.printer_id ORDER BY pul.usage_date DESC) AS rnk
                        FROM tbl_printer p
                        JOIN tbl_printer_usage_log pul ON p.printer_id = pul.printer_id
                        WHERE p.deleted = 'N'
                    ) latest_logs
                    WHERE rnk = 1;
                `);
                return response.rows;
            } catch (error) {
                console.error("Database Error:", error);
                throw new Error("Failed to fetch printer usage logs");
            }
        },
        async getAllDeviceIds() {
            try {
                const response = await pool.query(`
                    SELECT
                        device_id
                    FROM tbl_device_info p
                    WHERE
                        p.deleted='N'
                `);
                return response.rows;
            } catch (error) {
                console.error("Database Error:", error);
                throw new Error("Failed to fetch printer count.");
            }
        },

        // ----- Document ------------------------------------------
        async getFilteredDocumnets(
            query: string,
            userId: string,
            jobType: 'fax' | 'scan',
            itemsPerPage: number,
            currentPage: number
        ) {
            return Document.fetchFilteredDocumnets(pool, query, userId, jobType, itemsPerPage, currentPage);
        },
        async getFilteredDocumnetsPages(
            query: string,
            userId: string,
            jobType: 'fax' | 'scan',
            itemsPerPage: number
        ) {
            return Document.fetchFilteredDocumnetPages(pool, query, userId, jobType, itemsPerPage);
        },
        async deleteDocument(id: string) {
            'use server';
            return Action.deleteDocument(pool, id);
        },

        // ----- Log -----------------------------------------------
        async getPrinterUsageLogByUserId(
            userId: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Log.fetchPrinterUsageLogByUserId(pool, userId, itemsPerPage, currentPage);
        },
        async getPrinterUsageLogByUserIdPages(query: string, itemsPerPage: number) {
            return Log.fetchPrinterUsageLogByUserIdPages(pool, query, itemsPerPage);
        },
        async getFilteredAuditLogs(
            query:string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Log.fetchFilteredAuditLogs(pool, query, itemsPerPage, currentPage);
        },
        async getFilteredAuditLogsPages(query: string, itemsPerPage: number) {
            return Log.fetchFilteredAuditLogPages(pool, query, itemsPerPage);
        },
        async getAllTotalPageSum() {
            return Log.fetchAllTotalPageSum(pool);
        },
        async getTodayTotalPageSum() {
            return Log.fetchTodayTotalPageSum(pool);
        },
        async getTotalPagesPerDayFor30Days() {
            return Log.fetchTotalPagesPerDayFor30Days(pool);
        }
    }
}