
import { getInputProps, getSelectProps, getTextareaProps, useForm } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { parseWithZod } from "@conform-to/zod/v4";
import { Form, useFetcher } from "react-router";
import { userSchema } from "better-auth";
import { title } from "process";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type UserFormProps = {
  lastResult: any,
  defaultValue: {
    name: string;
    email: string;
    role: string;
  };
  submitting?: boolean;
  submitLabel?: string;
};

export function UserForm({
  lastResult,
  defaultValue,
  submitting = false,
  submitLabel = "保存",
}: UserFormProps) {
  // const [body, setBody] = useState(fields.body.value ?? "");

  const [form, fields] = useForm({
    lastResult,
    defaultValue: defaultValue,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: userSchema,
      });
    },
  });

  return (
    <Card>
      <CardContent className="space-y-4">

    <Form id={form.id}
      method="post" className="space-y-6">
      {form.errors?.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {error}
        </p>
      ))}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={fields.name.id}>名前</Label>
          <Input
            {...getInputProps(fields.name, { type: "text" })}
            required
          />
          <p className="text-sm text-destructive">
            {fields.name.errors}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fields.email.id}>email</Label>
          <Input
            {...getInputProps(fields.email, { type: "text" })}
            required
          />
          <p className="text-sm text-destructive">
            {fields.email.errors}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fields.role.id}>Role</Label>
          <select
            {...getSelectProps(fields.role)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">roleを選択してください</option>
            {["admin", "user"].map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>  
      </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>
    </Form>
    </CardContent>
    </Card>
  );
}
