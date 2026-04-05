"use client";

import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
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
import { useLocation } from "./context/LocationProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { FeatureFlags } from "@/lib/types/types";
import createNewPost from "@/pages/api/create-new-post";
import getAllTags from "@/pages/api/get-all-tags";
import getFeatureFlags from "@/pages/api/get-feature-flags";
import ComboboxMultiple from "./ui/combobox-multiple";
import { toast } from "sonner";
import { XIcon } from "lucide-react";

const defaultFeatureFlags: FeatureFlags = {
  tagsEnabled: false,
  usersEnabled: false,
  approvalEnabled: false,
};

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
});

export default function PostForm({ onClose }: { onClose: () => void }) {
  const { location, clearLocation } = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: featureFlags = defaultFeatureFlags } = useQuery<
    FeatureFlags,
    Error
  >({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await getFeatureFlags(supabase);

      if (error) {
        throw error;
      }

      if (!data) {
        return defaultFeatureFlags;
      }

      return {
        tagsEnabled: data.tagsEnabled,
        usersEnabled: data.usersEnabled,
        approvalEnabled: data.approvalEnabled,
      };
    },
  });

  const { data: tags = [] } = useQuery<Tag[], Error>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await getAllTags(supabase);

      if (error) {
        throw error;
      }

      return (data ?? []) as Tag[];
    },
    enabled: featureFlags?.tagsEnabled ?? false,
  });

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
      setIsSubmitting(true);

      // const { error } = await createNewPost(supabase, {
      //   title: value.title,
      //   body: value.body,
      //   tagIds: featureFlags?.tagsEnabled
      //     ? value.tags.map((tag) => tag.id)
      //     : [],
      // });

      // setIsSubmitting(false);

      // if (error) {
      //   toast.error("Failed to create post", {
      //     description: error.message,
      //     position: "bottom-right",
      //   });
      //   return;
      // }

      // await Promise.all([
      //   queryClient.invalidateQueries({ queryKey: ["posts"] }),
      //   queryClient.invalidateQueries({ queryKey: ["map-posts"] }),
      // ]);

      // form.reset();
      // clearLocation();
      console.log("Form submitted with values:", value);

      toast.success("Post created", {
        description: "Your post was saved successfully.",
        position: "bottom-right",
      });
    },
  });

  useEffect(() => {
    if (!featureFlags?.tagsEnabled) {
      form.setFieldValue("tags", []);
    }
  }, [featureFlags?.tagsEnabled, form]);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-8 gap-4">
      <CardHeader>
        <div className="flex flex-row">
          <CardTitle>Create Post</CardTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <CardDescription>
          Add a new post for the selected map location.
        </CardDescription>
        {location ? (
          <CardDescription>
            Location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </CardDescription>
        ) : (
          <CardDescription>
            Select a point on the map to place this post.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex w-full flex-1 flex-col overflow-hidden">
        <form
          id="post-form"
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="flex-1">
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Sunset at the Old Venetian Harbor"
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
                  <Field
                    data-invalid={isInvalid}
                    className="flex flex-1 flex-col"
                  >
                    <FieldLabel htmlFor={field.name}>Body</FieldLabel>
                    <InputGroup className="flex flex-1 flex-col">
                      <SimpleEditor
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e?.toString() || "")
                        }
                        placeholder="Share what makes this place worth pinning on the map."
                        className="flex-1"
                        editorContentClassName="p-4"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/500 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Describe the place, what happened there, or why others
                      should check it out.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            {featureFlags?.tagsEnabled ? (
              <form.Field name="tags">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                      <InputGroup>
                        <ComboboxMultiple
                          items={tags}
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
            ) : null}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" form="post-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Post"}
          </Button>
        </Field>
      </CardFooter>
    </div>
  );
}
