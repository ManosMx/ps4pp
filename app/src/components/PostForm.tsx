"use client";

import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "./ui/input";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { useLocation } from "./context/LocationProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ComboboxMultiple from "./ui/combobox-multiple";

type Tag = {
  id: number;
  value: string;
  color: string;
};

const formSchema = z.object({
  title: z
    .string()
    .min(4, "Post title must be at least 4 characters.")
    .max(32, "Post title must be at most 32 characters."),
  body: z
    .string()
    .min(10, "Body must be at least 10 characters.")
    .max(500, "Body must be at most 500 characters."),
  tags: z.array(z.object({ id: z.number(), value: z.string() })),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export default function PostForm() {
  const { location, action } = useLocation();
  const [tags, setTags] = useState<Tag[] | null>(null);

  useEffect(() => {
    supabase
      .from("tags")
      .select("*")
      .then((result) => setTags(result.data));
  }, []);

  const form = useForm({
    defaultValues: {
      title: "",
      body: "",
      tags: [] as Omit<Tag, "color">[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted successfully with ", value);
    },
  });

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>
          Help us improve by reporting bugs you encounter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Login button not working on mobile"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="body">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Body</FieldLabel>
                    <InputGroup>
                      <MinimalTiptapEditor
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e?.toString() || "")
                        }
                        placeholder="I'm having an issue with the login button on mobile."
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/100 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Include steps to reproduce, expected behavior, and what
                      actually happened.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="tags">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                    <InputGroup>
                      <ComboboxMultiple
                        items={tags ?? []}
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                      />
                    </InputGroup>
                    <FieldDescription>
                      Select tags relevant to your post.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="bug-report-form">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
