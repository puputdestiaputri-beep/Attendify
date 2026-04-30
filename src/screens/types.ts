export interface Student {
  id: number | string;
  name: string;
  nim: string;
  username?: string;
  prodi: string;
  kelas: string;
  email: string;
  manual_permission?: boolean;
  permission_status?: string;
}

