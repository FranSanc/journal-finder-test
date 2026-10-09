import FrontiersPreset from "@frontiers/prime-preset";
import { Theme, useTheme } from "@primeuix/themes";

/**
 * Applies the same Frontiers Prime preset acrosearch and lasagnaexperience use.
 * PrimeReact 10 still needs its own theme.css for component structure, so this
 * injects the preset's design tokens (--p-*) and component CSS on top.
 */
export function applyFrontiersPrimePreset() {
  useTheme({
    preset: FrontiersPreset,
    options: {
      darkModeSelector: "none",
    },
  });

  const chunks = [];
  const common = Theme.getCommon(undefined, undefined);
  chunks.push(
    common.primitive?.css ?? "",
    common.semantic?.css ?? "",
    common.global?.css ?? "",
    typeof common.style === "string" ? common.style : "",
  );

  const components = Theme.getPreset()?.components;
  for (const name of Object.keys(components ?? {})) {
    const component = Theme.getComponent(name, undefined);
    chunks.push(component.css ?? "");
    if (typeof component.style === "string") {
      chunks.push(component.style);
    }
  }

  const css = chunks.filter(Boolean).join("\n");
  if (!css) return;

  const id = "frontiers-prime-preset";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}
