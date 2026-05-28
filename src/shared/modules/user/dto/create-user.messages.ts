export const CreateUserMessages = {
  name: {
    lengthFiend: 'min length is 1, max length is 15',
    invalidFormat: 'name is required'
  },

  email: {
    invalidFormat: 'email must be valid address'
  },

  avatarPath: {
    invalidFormat: 'avatarPath must be in the format .jpg or .png'
  },

  password: {
    lengthFiend: 'min length is 6, max length is 12',
    invalidFormat: 'password is required'
  },

  type: {
    invalidFormat: 'type must be ordinary or pro'
  }
} as const;
