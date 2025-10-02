// CustomSunEditor.tsx
"use client";

import React from "react";
import axios from "axios";
import SunEditor from "suneditor-react";
import SunEditorCore from "suneditor/src/lib/core";
import "suneditor/dist/css/suneditor.min.css";
import plugins from "suneditor/src/plugins";
import { picmo } from "suneditor-picmo-emoji";
import { toast } from "react-toastify";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Base URL của API, ưu tiên prop -> NEXT_PUBLIC_API_URL -> fallback localhost */
  uploadBaseUrl?: string;
};

type State = { value: string };

// Lấy đúng chữ ký từ SunEditor để luôn khớp version typings
type UploadBeforeFn = NonNullable<
  React.ComponentProps<typeof SunEditor>["onImageUploadBefore"]
>;
type UploadBeforeHandler = Parameters<UploadBeforeFn>[2];

class CustomSunEditor extends React.Component<Props, State> {
  private editor: SunEditorCore | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { value: props.value };
  }

  private handleChange = (value: string) => {
    this.setState({ value });
    this.props.onChange(value);
  };

  private getSunEditorInstance = (sunEditor: SunEditorCore) => {
    this.editor = sunEditor;
  };

  private sortedFontOptions: string[] = [
    "Logical",
    "Salesforce Sans",
    "Garamond",
    "Sans-Serif",
    "Serif",
    "Times New Roman",
    "Helvetica",
  ].sort();

  /** Custom upload ảnh: gọi API rồi trả URL cho SunEditor */
  private onImageUploadBefore: UploadBeforeFn = (
    files,
    _info,
    uploadHandler: UploadBeforeHandler
  ) => {
    const file = files?.[0];
    if (!file) return false; // phải trả về boolean (UploadBeforeReturn)

    (async () => {
      try {
        const API_BASE =
          this.props.uploadBaseUrl ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";

        const ENDPOINT = `${API_BASE.replace(/\/+$/, "")}/api/upload/image`;

        const fd = new FormData();
        // KEY phải là "file" như ảnh Postman
        fd.append("file", file);

        const res = await axios.post(ENDPOINT, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Chấp nhận nhiều dạng response: string | {url} | {path}
        const data = res.data as any;
        let url: string | undefined;

        const toAbs = (p: string) =>
          p.startsWith("http")
            ? p
            : `${API_BASE.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;

        if (typeof data === "string") url = toAbs(data);
        else if (data?.url) url = toAbs(String(data.url));
        else if (data?.path) url = toAbs(String(data.path));

        if (!url) {
          toast.error("Upload thành công nhưng không có URL ảnh trả về.");

          return;
        }

        // Báo cho SunEditor biết ảnh đã sẵn sàng để chèn
        uploadHandler({
          result: [{ url, name: file.name, size: file.size }],
        });
      } catch (e: any) {
        toast.error("Upload ảnh thất bại");
      }
    })();

    // Quan trọng: trả về false để chặn upload mặc định (đúng kiểu boolean)
    return false;
  };

  render() {
    return (
      <SunEditor
        height="400px"
        defaultValue={this.state.value}
        onChange={this.handleChange}
        getSunEditorInstance={this.getSunEditorInstance}
        onImageUploadBefore={this.onImageUploadBefore}
        setOptions={{
          plugins: { ...plugins, picmo },
          buttonList: [
            ["undo", "redo"],
            ["font", "fontSize", "formatBlock"],
            ["paragraphStyle", "blockquote"],
            [
              "bold",
              "underline",
              "italic",
              "strike",
              "subscript",
              "superscript",
            ],
            ["fontColor", "hiliteColor"],
            ["align", "list", "lineHeight"],
            ["outdent", "indent"],
            ["table", "horizontalRule", "link", "image", "video"],
            ["fullScreen", "showBlocks", "codeView"],
            ["preview", "print"],
            ["removeFormat"],
            ["picmo"],
          ],
          defaultTag: "div",
          minHeight: "500px",
          showPathLabel: false,
          font: this.sortedFontOptions,
        } as any}
      />
    );
  }
}

export default CustomSunEditor;
