import Editor from "@monaco-editor/react";
import { useTheme } from "../../app/theme-context";
import "../../lib/monaco-setup";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height?: string;
  ariaLabel: string;
}

export function CodeEditor({
  language,
  value,
  onChange,
  height = "320px",
  ariaLabel,
}: CodeEditorProps) {
  const { theme } = useTheme();

  return (
    <div
      className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700"
      role="group"
      aria-label={ariaLabel}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
