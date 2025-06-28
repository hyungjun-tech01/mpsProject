'use client';

import { useEffect } from 'react';

export default function LogClient({
  userName,
  groupId,
  query,
  applicationPage,
  applicationAction
}: {
  userName: string;
  groupId?: string;
  query: string;
  applicationPage: string;
  applicationAction: string;
}) {
  useEffect(() => {
    const logAccess = async () => {
      const logData = new FormData();
      logData.append('application_page', applicationPage);
      logData.append('application_action', applicationAction);
      logData.append('application_parameter', `조회조건{${query}}`);
      logData.append('created_by', userName);

      await fetch('/api/log', {
        method: 'POST',
        body: logData,
      });
    };

    logAccess();
  }, [userName, groupId, query, applicationPage, applicationAction]);

  return null;
}