import { User } from './User';
// Generated by https://quicktype.io

export interface Reservation {
    id:   number;
    dni:  string;
    date: string;
    hash: number;
    user?: User;
}
