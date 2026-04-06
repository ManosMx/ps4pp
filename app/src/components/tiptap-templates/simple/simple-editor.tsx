"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Content,
  Editor,
  EditorContent,
  EditorContext,
  useEditor,
  UseEditorOptions,
} from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder, Selection } from "@tiptap/extensions";
import Youtube from "@tiptap/extension-youtube";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Lib ---
import { cn, handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

import useThrottledCallback from "@/hooks/use-throttled-callback";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  throttleDelay?: number;
  onUpdate?: (content: Content) => void;
  onBlur?: (content: Content) => void;
  uploader?: (file: File) => Promise<string>;
}

export function SimpleEditor({
  value,
  placeholder = "",
  className,
  editorClassName,
  throttleDelay = 0,
  onUpdate,
  onBlur,
  ...props
}: UseMinimalTiptapEditorProps) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const throttledSetValue = useThrottledCallback(
    (value: Content) => onUpdate?.(value),
    throttleDelay,
  );

  const handleUpdate = useCallback(
    (editor: Editor) =>
      throttledSetValue(editor.isEmpty ? "" : editor.getHTML()),
    [throttledSetValue],
  );

  const handleBlur = useCallback(
    (editor: Editor) => onBlur?.(editor.isEmpty ? "" : editor.getHTML()),
    [onBlur],
  );

  const handleCreate = useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value);
      }
    },
    [value],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-hidden", editorClassName),
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        blockquote: { HTMLAttributes: { class: "block-node" } },
        // bold
        bulletList: { HTMLAttributes: { class: "list-node" } },
        // document
        dropcursor: {
          width: 2,
          class: "ProseMirror-dropcursor border-primary",
        },
        // gapcursor
        // hardBreak
        heading: { HTMLAttributes: { class: "heading-node" } },
        // undoRedo
        // italic
        // listItem
        // listKeymap
        orderedList: { HTMLAttributes: { class: "list-node" } },
        paragraph: { HTMLAttributes: { class: "text-node" } },
        link: {
          enableClickSelection: true,
          openOnClick: false,
          HTMLAttributes: {
            class: "link",
          },
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Selection,
      Placeholder.configure({ placeholder: () => placeholder }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        height: 300,
        width: 530,
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 1,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    onUpdate: ({ editor }) => handleUpdate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    ...props,
  });

  const [toolbarHeight, setToolbarHeight] = useState(0);

  useEffect(() => {
    if (toolbarRef.current) {
      setToolbarHeight(toolbarRef.current.getBoundingClientRect().height);
    }
  }, []);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarHeight,
  });

  const effectiveMobileView = !isMobile ? "main" : mobileView;

  if (!editor) return null;

  return (
    <div
      className={cn("flex w-0 min-w-full flex-col overflow-hidden", className)}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {effectiveMobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={
                effectiveMobileView === "highlighter" ? "highlighter" : "link"
              }
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="textbox" />
      </EditorContext.Provider>
    </div>
  );
}
