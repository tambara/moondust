import type { createDb } from "~/db";
import { authClient } from "~/lib/auth-client";

type Database = ReturnType<typeof createDb>;

export type UserInput = {
  name: string;
  email: string;
  role: "user" | "admin";
  password: string;
};

export async function createUser(db: Database, data: UserInput) {
  const result = await authClient.admin.createUser({
    ...data,
    role: "user",
  });

  if (result.error) throw new Error(result.error.message);
}

export async function updateUser(
  currentUserId: string,
  db: Database,
  id: string,
  data: UserInput,
) {
  const result = await authClient.admin.updateUser({
    userId: id,
    data: {
      name: data.name,
      email: data.email,
    },
  });

  if (result.error) throw new Error(result.error.message);

  if (id !== currentUserId) {
    const roleResult = await authClient.admin.setRole({
      userId: id,
      role: data.role,
    });

    if (roleResult.error) {
      throw new Error(roleResult.error.message);
    }
  }

}
