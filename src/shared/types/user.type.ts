export enum UserType{
  Ordinary = 'ordinary',
  Pro = 'pro'
}

export type User = {
  name: string;
  email: string;
  avatarPath?: string;
  type: UserType;
}
