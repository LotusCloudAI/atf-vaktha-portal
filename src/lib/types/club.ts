export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface State {
  id: string;
  name: string;
  countryId: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
}

export interface Club {
  id: string;
  clubName: string;
  countryId: string;
  stateId: string;
  cityId: string;
  language: string;
  meetingDay: string;
  meetingTime: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  clubId: string;
  role: 'member' | 'club_officer' | 'admin';
}