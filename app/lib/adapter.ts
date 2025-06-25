import { Pool } from "pg";
import * as User from "./fetchUserData";
import * as Group from "./fetchGroupData";
import * as Device from "./fetchDeviceData";
import * as Document from "./fetchDocumentData";
import * as Log from "./fetchLogData";
import * as RegularExp from "./fetchRegularExpPrivateInfoData";
import * as ApplicationLog from "./fetchApplicationLog";
import type { BasicState, BasicState2, UserState } from "./actions";
import * as Action from "./actions";
import type { GroupState } from "./actionsGroup";
import * as GroupAction from "./actionsGroup";
import * as Print from "./fetchPrintSpoolData";
// import type { PrintState } from "./actionPrint";
import * as PrintAction from "./actionPrint";
import * as SettingAction from "./actionSetting";
import type { RegularExpState } from "./actionSetting";


const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS),
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
        async createUser(prevState: void | UserState, formData: FormData) {
            'use server';
            return Action.createUser(pool, prevState, formData);
        },
        async modifyUser(id: string, prevState: void | UserState, formData: FormData) {
            'use server';
            return Action.modifyUser(pool, id, prevState, formData);
        },
        async deleteUser(userId: string, param: string) {
            'use server';

            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'User');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{userId:${userId}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return Action.deleteUser(pool, userId)
        },
        async getAccount(userName: string) {
            return User.fetchAccount(pool, userName)
        },
        async updateAccount(id: string | undefined, prevState: void | UserState, formData: FormData) {
            'use server';
            return Action.updateAccount(pool, prevState, formData, id);
        },
        async changeBalance(id: string, prevState: void | UserState, formData: FormData) {
            'use server';
            return Action.changeBalance(pool, id, prevState, formData);
        },
        async getAllDepts() {
            return User.fetchAllDepts(pool);
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
        async getFilteredGroupsByManager(
            managerId: string,
            query: string,
            groupType: string,
            itemsPerPage: number,
            currentPage: number,
            locale: string
        ) {
            return Group.fetchFilteredGroupsByManager(pool, managerId, query, groupType, itemsPerPage, currentPage, locale);
        },
        async getFilteredGroupsByManagerPages(
            managerId: string,
            query: string,
            groupType: string,
            itemsPerPage: number,
        ) {
            return Group.fetchFilteredGroupsByManagerPages(pool, managerId, query, groupType, itemsPerPage);
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
        async createDeviceGroup(prevState: void | GroupState, formData: FormData) {
            'use server';
            return GroupAction.createDeviceGroup(pool, prevState, formData);
        },
        async modifyDeviceGroup(id: string, prevState: void | GroupState, formData: FormData) {
            'use server';
            return GroupAction.modifyDeviceGroup(pool, id, prevState, formData);
        },
        async createUserGroup(prevState: void | GroupState, formData: FormData) {
            'use server';
            return GroupAction.createUserGroup(pool, prevState, formData);
        },
        async modifyUserGroup(id: string, prevState: void | GroupState, formData: FormData) {
            'use server';
            return GroupAction.modifyUserGroup(pool, id, prevState, formData);
        },
        async createSecurityGroup(prevState: void | GroupState, formData: FormData) {
            'use server';
            return GroupAction.createSecurityGroup(pool, prevState, formData);
        },
        async modifySecurityGroup(id: string, prevState: void | GroupState, formData: FormData) {
            'use server';
            return GroupAction.modifySecurityGroup(pool, id, prevState, formData);
        },
        async deleteGroup(id: string, param: string) {
            'use server';

            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'Group');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{id:${id}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return GroupAction.deleteGroup(pool, id);
        },

        // ----- Device --------------------------------------------
        async getFilteredDevices(
            query: string,
            itemsPerPage: number,
            currentPage: number,
            groupId?: string
        ) {
            return Device.fetchFilteredDevices(pool, query, itemsPerPage, currentPage, groupId);
        },
        async getDevicesPages(query: string, itemsPerPage: number) {
            return Device.fetchDevicesPages(pool, query, itemsPerPage);
        },
        async getDeviceById(id: string) {
            return Device.fetchDeviceById(pool, id);
        },
        async getDeviceFaxLineById(id: string) {
            return Device.fetchDeviceFaxLineById(pool, id);
        },
        async getDevicesbyGroupManager(
            userId: string,
            query: string,
            itemsPerPage: number,
            currentPage: number
        ) {
            return Device.fetchDevicesbyGroupManager(pool, userId, query, itemsPerPage, currentPage);
        },
        async getDevicesbyGroupManagerPages(userId: string, query: string, itemsPerPage: number) {
            return Device.fetchDevicesbyGroupManagerPages(pool, userId, query, itemsPerPage);
        },
        async createDevice(newDevice: Record<string, string | null>) {
            'use server';
            return Device.fetchCreateDevice(pool, newDevice);
        },
        async getPrinterGroup() {
            return Device.fetchPrinterGroup(pool);
        },
        async deleteDevice(id: string, param: string) {
            'use server';

            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'Device');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{id:${id}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return Device.fetchDeleteDevice(pool, id);
        },
        async fetchDeleteFaxLineInfo(id: string) {
            'use server';
            console.log('adapter fetchDeleteFaxLineInfo', id);
            return Device.fetchDeleteFaxLineInfo(pool, id);
        },
        async modifyDevice(newDevice: Record<string, string | null>) {
            'use server';
            return Device.fetchModifyDevice(pool, newDevice);
        },
        async saveFaxLineInfo(
            saveFaxLineData: Record<string, string | null>,
            created_by: string
        ) {
            'use server';
            return Device.fetchSaveFaxLineInfo(pool, saveFaxLineData, created_by);
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
        async getDevicesStatus() {
            try {
                const response = await pool.query(`
                    SELECT
                        SUM(CASE WHEN device_status = '정상' THEN 1 
                                when device_status is null then 1
                                ELSE 0 
                                END) as normal_count,
                        SUM(CASE WHEN device_status = '오류' THEN 1 ELSE 0 END) as error_count,
                        SUM(CASE WHEN device_status = '경고' THEN 1 ELSE 0 END) as warning_count,
                        SUM(CASE WHEN device_status = '토너부족' THEN 1 ELSE 0 END) as low_supply_count,
                        SUM(CASE WHEN device_status = '오프라인' THEN 1 ELSE 0 END) as offline_count
                    FROM tbl_device_info
                    WHERE deleted = 'N'
                `);
                return response.rows[0];
            } catch (error) {
                console.error("Database Error:", error);
                throw new Error("Failed to fetch printer count.");
            }
        },
        async fetchFilteredDevices(
            loginName: string | undefined,
            query: string,
            itemsPerPage: number,
            currentPage: number,
            groupId?: string
        ) {
            return Device.fetchFilteredDevices(pool, query, itemsPerPage, currentPage, groupId);
        },
        async getAllDevices() {
            return Device.fetchAllDevices(pool)
        },

        // ----- Document ------------------------------------------
        async getFilteredDocumnets(
            query: string,
            userName: string,
            isAdmin: boolean,
            jobType: 'fax' | 'scan',
            itemsPerPage: number,
            currentPage: number
        ) {
            return Document.fetchFilteredDocumnets(pool, query, userName, isAdmin, jobType, itemsPerPage, currentPage);
        },
        async getFilteredDocumnetsPages(
            query: string,
            userName: string,
            isAdmin: boolean,
            jobType: 'fax' | 'scan',
            itemsPerPage: number
        ) {
            return Document.fetchFilteredDocumnetPages(pool, query, userName, isAdmin, jobType, itemsPerPage);
        },
        async shareDocument(initState: void | BasicState, formData: FormData) {
            'use server';
            return Action.shareDocument(pool, initState, formData);
        },
        async deleteDocument(id: string, param: string) {
            'use server';

            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'Document');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{id:${id}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return Action.deleteDocument(pool, id, deletedBy);
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
            query: string,
            itemsPerPage: number,
            currentPage: number,
            fromDate: string | null,
            toDate: string | null,
            privacy: string | null,
            security: string | null,
        ) {
            // console.log('fromDate', fromDate);
            //, fromDate , toDate
            return Log.fetchFilteredAuditLogs(pool, query, itemsPerPage, currentPage, fromDate, toDate, privacy, security);
        },
        async getFilteredAuditLogsPages(query: string, itemsPerPage: number, fromDate: string | null, toDate: string | null, privacy: string | null, security: string | null) {
            //, fromDate : string|null, toDate:string|null
            // , fromDate, toDate
            return Log.fetchFilteredAuditLogPages(pool, query, itemsPerPage, fromDate, toDate, privacy, security);
        },
        async getFilteredRetiredAuditLogs(
            query: string,
            itemsPerPage: number,
            currentPage: number,
            fromDate: string | null,
            toDate: string | null,
            privacy: string | null,
            security: string | null,
        ) {
            // console.log('fromDate', fromDate);
            //, fromDate , toDate
            return Log.fetchFilteredRetiredAuditLogs(pool, query, itemsPerPage, currentPage, fromDate, toDate, privacy, security);
        },
        async getFilteredRetiredAuditLogsPages(query: string, itemsPerPage: number, fromDate: string | null, toDate: string | null, privacy: string | null, security: string | null) {
            //, fromDate : string|null, toDate:string|null
            // , fromDate, toDate
            return Log.fetchFilteredRetiredAuditLogPages(pool, query, itemsPerPage, fromDate, toDate, privacy, security);
        },

        async getPrivacytDetectedData(period: string, periodStart?: string, periodEnd?: string, dept?: string, user?: string) {
            return Log.fetchPrivacytDetectedData(pool, period, periodStart, periodEnd, dept, user);
        },
        async getTodayTotalPageSum() {
            return Log.fetchTodayTotalPageSum(pool);
        },
        async getTotalPagesPerDayFor30Days(userName: string | null | undefined) {
            return Log.fetchTotalPagesPerDayFor30Days(pool, userName);
        },
        async getTop5UserFor30days() {
            return Log.fetchTop5UserFor30days(pool);
        },
        async getTop5DevicesFor30days() {
            return Log.fetchTop5DevicesFor30days(pool);
        },
        async getUsageStatusByUser(userName: string) {
            return Log.fetchUsageStatusByUser(pool, userName);
        },
        async getPrivacyDetectInfoByUsers(period: string, periodStart?: string, periodEnd?: string, dept?: string, user?: string) {
            return Log.fetchPrivacyDetectInfoByUsers(pool, period, periodStart, periodEnd, dept, user);
        },
        async getPrintInfoByQuerygetPrivacyDetectInfoByUsers(periodStart: string, periodEnd: string, dept?: string, user?: string, device?: string) {
            return Log.fetchPrintInfoByQuery(pool, periodStart, periodEnd, dept, user, device);
        },
        async getPrivacyInfoByQuerygetPrivacyDetectInfoByUsers(periodStart: string, periodEnd: string, dept?: string, user?: string) {
            return Log.fetchPrivacyInfoByQuery(pool, periodStart, periodEnd, dept, user);
        },

        // ----- Print Spool --------------------------------------
        async getFilteredPrintSpoolPages(userName: string, itemsPerPage: number) {
            return Print.fetchFilteredPrintSpoolPages(pool, userName, itemsPerPage);
        },
        async getFilteredPrintSpool(userName: string, itemsPerPage: number, currentPage: number) {
            return Print.fetchFilteredPrintSpool(pool, userName, itemsPerPage, currentPage);
        },
        async deleteSelectedPrint(list: string[], param: string) {
            'use server';
            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'Print');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{id:${list}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return PrintAction.deleteSelected(pool, list);
        },
        async printSelectedPrint(list: string[]) {
            'use server';
            return PrintAction.printSelected(pool, list);
        },

        // ----- Setting ---------------------------------------------
        async batchCreateUser(id: string, prevState: void | BasicState, formData: FormData) {
            'use server';
            return Action.batchCreateUser(pool, id, prevState, formData);
        },
        async getFilteredIFUsers(query: string, itemsPerPage: number, currentPage: number) {
            return User.fetchFilteredIFUsers(pool, query, itemsPerPage, currentPage);
        },
        async getFilteredIFUserPages(query: string, itemsPerPage: number) {
            return User.fetchFilteredIFUserPages(pool, query, itemsPerPage);
        },
        async submitSelectedUsers(prevState: void | BasicState2, formData: FormData) {
            'use server';
            return Action.uploadSelectedUser(pool, prevState, formData);
        },
        async deleteUserInIF(id: string, param: string) {
            'use server';
            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'UserInIF');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{id:${id}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return Action.deleteUserIF(pool, id);
        },
        async getFilteredRegularExp(query: string, itemsPerPage: number, currentPage: number) {
            return RegularExp.filteredRegularExp(pool, query, itemsPerPage, currentPage);
        },
        async getFilteredRegularExpPages(query: string, itemsPerPage: number) {

            return RegularExp.filteredRegularExpPages(pool, query, itemsPerPage);
        },
        async createRegularExp(prevState: void | RegularExpState, formData: FormData) {
            'use server';
            return SettingAction.createRegularExp(pool, prevState, formData);
        },
        async deleteRegularExp(id: string, param: string) {
            'use server';

            // console.log('deleteRegularExp', FormData);
            const [deletedBy, ipAddress] = param.split(',');

            const logData = new FormData();
            logData.append('application_page', 'RegEx/Security');
            logData.append('application_action', 'Delete');
            logData.append('application_parameter', `{id:${id}}`);
            logData.append('created_by', deletedBy);
            logData.append('ip_address', ipAddress);

            Action.applicationLog(pool, logData);

            return SettingAction.deleteRegularExp(pool, id);
        },

        // ----- Application Log ----------------------------------
        async applicationLog(formData: FormData) {
            'use server';
            return Action.applicationLog(pool, formData);
        },
        async getFilteredApplicationLog(query: string, itemsPerPage: number, currentPage: number, dateFrom: string | null, dateTo: string | null) {

            return ApplicationLog.fetchFilteredApplicationLog(pool, query, itemsPerPage, currentPage, dateFrom, dateTo);
        },
        async getFilteredApplicationLogPages(query: string, itemsPerPage: number, dateFrom: string | null, dateTo: string | null) {

            return ApplicationLog.fetchFilteredApplicationLogPages(pool, query, itemsPerPage, dateFrom, dateTo);
        },

        // -----------------------------------------------------------
    }
}