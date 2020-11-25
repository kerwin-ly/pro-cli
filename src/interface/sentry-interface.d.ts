export interface CreateParams {
  name: string;
  team: string;
  platform?: string;
}

export interface Project {
  avatar: {
    avatarUuid: number;
    avatarType: string;
  };
  id: string;
  name: string;
  slug: string;
  status: string;
}
