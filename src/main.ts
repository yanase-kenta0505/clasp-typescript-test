declare var global: {
  onUpdateEvent: any,
  // getUpdatedEvents: any,
  // getRelativeDate: any
}

interface CalendarUpdatedEvent {
  authMode: GoogleAppsScript.Script.AuthMode;
  calendarId: string;
  triggerUid: string;
}


global.onUpdateEvent = (e:CalendarUpdatedEvent) => {
  console.log(`calendarId: ${e.calendarId}`)  
  getUpdatedEvents(e.calendarId).forEach(event => {
    console.log(`title:${event.summary}`)
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
