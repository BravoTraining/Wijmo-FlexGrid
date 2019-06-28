export class User {
  id: number;
  name: string;
  birthday: Date;
  sex: string;
  email: string;
  phoneNumber: string;
  address: string;
  isBlock: string;
}

export class Roles {
  id: number;
  role: string;
  permission: string;
}

export const sexs = ["Male", "Female"];
export const blocks = ["true", "false"];

export const adminUser = [
  {
      id: 1,
      username: "bravo",
      password: "bravo@1234",
      isActive: "true"
  },

  {
      id: 2,
      username: "angular",
      password: "Angular@123",
      isActive: "true"
  },

  {
      id: 3,
      username: "bravohn",
      password: "bravohn@123",
      isActive: "true"
  }

]
