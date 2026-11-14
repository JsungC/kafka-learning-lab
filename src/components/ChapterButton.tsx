import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import {
  Children,
  isValidElement,
  type ReactNode,
  type ComponentProps,
} from "react";
function labelText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? ` ${labelText(child.props.children)} `
          : "",
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
export function ChapterButton({
  children,
  disabled,
  className,
  title,
  ...props
}: ComponentProps<"button">) {
  return (
    <Button
      {...props}
      label={labelText(children)}
      isDisabled={disabled}
      variant={className?.includes("primary") ? "primary" : "secondary"}
      size="md"
      tooltip={title}
      className="chapter-action"
    >
      <Text type="inherit" color="inherit" textWrap="wrap" display="block">
        {labelText(children)}
      </Text>
    </Button>
  );
}
