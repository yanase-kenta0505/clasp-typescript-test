declare var global: {
  onUpdateEvent: any,
  // getUpdatedEvents: any,
  // getRelativeDate: any
}

const WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAAZs0GmJQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=6QK88sMDTyaQWNTgq4-Qrx6_6W0H4y7Qztlq9kNY5So%3D"

interface CalendarUpdatedEvent {
  authMode: GoogleAppsScript.Script.AuthMode;
  calendarId: string;
  triggerUid: string;
}


global.onUpdateEvent = (e:CalendarUpdatedEvent) => {
  console.log(`calendarId: ${e.calendarId}`)  
  getUpdatedEvents(e.calendarId).forEach((event) => {
    let message: string;
    if (event.status === "cancelled") {
      message = `
      イベントが削除されました。
      `
    } else {
      message = `
      イベントが更新されました。\n
      *${event.summary}*
      ==================================================\n
      開始日時：${event.start?.dateTime}\n
      終了日時：${event.end?.dateTime}\n
      説明  ：${event.description}\n
      <${event.htmlLink}|LINK>
      `
    }
    sendMessageToChat(WEBHOOK_URL, message)
  });
}

class CalendarQueryOptions {
  maxResults?: number;
  syncToken?: string;
  timeMin?: string
}

/**
 * 指定されたCalendarIdに紐付くイベントを前回取得した時から更新があったイベントのみ取得する。
 * 過去に一度もイベントを取得していない場合、過去30日分を取得する。
 *
 * @param {string} calendarId カレンダーを一意に識別するID
 * @returns {GoogleAppsScript.Calendar.Schema.Event[]} イベントの一覧（最大100件）
 */

function getUpdatedEvents(calendarId:string): GoogleAppsScript.Calendar.Schema.Event[]{
  const properties = PropertiesService.getUserProperties()
  const key = `syncToken:${calendarId}`
  const syncToken = properties.getProperty(key)

  let options: CalendarQueryOptions = { 
    maxResults:100
  }
  
  if(syncToken) {
    options = { ...options, syncToken: syncToken}
  }else {
    options = { ...options, timeMin:getRelativeDate(-30,0).toISOString() }
  }

  const events = Calendar.Events?.list(calendarId, options)

  if(events?.nextSyncToken) {
    properties.setProperty(key, events?.nextSyncToken)
  }

  return events?.items ? events.items : []
}

function getRelativeDate(daysOffset: number, hour: number) {
  let date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(hour)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

function sendMessageToChat(webHookURL: string, message: string): void {
  const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    payload: JSON.stringify({
      text: message
    }),
    method: "post",
    contentType: "application/json",
  };
  const response = UrlFetchApp.fetch(webHookURL, params);
  console.log(`repsonse:${response}`);
}
