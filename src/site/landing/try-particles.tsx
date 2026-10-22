"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Keyboard, Moon, MousePointer2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import lab from "./interaction-lab.module.css";

const animations = ["none", "compression-bloom", "light-through-glass", "precision-snap"] as const;
type Animation = (typeof animations)[number];
const animationNames: Record<Animation, string> = {
  none: "None", "compression-bloom": "Compression Bloom", "light-through-glass": "Light Through Glass", "precision-snap": "Precision Snap",
};
const modes = ["feel", "feedback", "keyboard"] as const;
type Mode = (typeof modes)[number];
const modeNames: Record<Mode, string> = {
  feel: "Interaction feel", feedback: "Action feedback", keyboard: "Keyboard interaction",
};
const modeIcons = { feel: MousePointer2, feedback: Activity, keyboard: Keyboard };

export function TryParticles() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("feel");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [animation, setAnimation] = useState<Animation>("none");
  const [activationCount, setActivationCount] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "pending" | "error" | "success">("idle");
  const [destination, setDestination] = useState("dashboard");

  useEffect(() => {
    if (feedback !== "pending") return;
    const timeout = window.setTimeout(() => {
      setFeedback(attempt === 1 ? "error" : "success");
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [attempt, feedback]);

  const startAction = () => {
    if (feedback === "pending") return;
    setAttempt((current) => current + 1);
    setFeedback("pending");
  };
  const themeClass = theme === "dark" ? lab.previewDark : lab.previewLight;

  return (
    <section id="first-particle" className={lab.section} aria-labelledby="first-particle-title">
      <div className={lab.intro}>
        <h2 id="first-particle-title">Feel the difference.</h2>
        <p data-reading-surface>Small details shape how an interface responds. Try the primitives, then see where their behavior ends and your application begins.</p>
      </div>

      <div className={`${lab.lab} ${themeClass}`} data-preview-theme={theme} data-ui>
        <div className={lab.labHeader}>
          <p>Interaction lab</p>
          <div className={lab.themeControl}>
            <Sun size={16} aria-hidden="true" />
            <Switch aria-label="Use dark preview appearance" checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            <Moon size={16} aria-hidden="true" />
          </div>
        </div>

        <div className={lab.modeTabs} role="radiogroup" aria-label="Interaction demonstration">
          {modes.map((value) => { const Icon = modeIcons[value]; return (
            <label key={value} className={lab.modeTab}>
              <input type="radio" name={`${id}-mode`} value={value} checked={mode === value} onChange={() => setMode(value)} />
              <Icon size={18} aria-hidden="true" /><span>{modeNames[value]}</span>
            </label>
          ); })}
        </div>

        <div className={lab.demo}>
          {mode === "feel" && (
            <div className={lab.demoContent}>
              <div>
                <h3>Let the action have a feel.</h3>
                <p>Choose one response, then activate the button. Effects acknowledge input; they never claim the work is complete.</p>
              </div>
              <fieldset className={lab.animationChoices}>
                <legend>Interaction effect</legend>
                {animations.map((value) => (
                  <label key={value}>
                    <input type="radio" name={`${id}-animation`} value={value} checked={animation === value} onChange={() => setAnimation(value)} />
                    <span>{animationNames[value]}</span>
                  </label>
                ))}
              </fieldset>
              <div className={lab.actionRow}>
                <Button size="lg" animation={animation} onClick={() => setActivationCount((count) => count + 1)}>Try the button</Button>
                <span role="status" aria-live="polite">{activationCount === 0 ? "Ready when you are" : `Activated ${activationCount} ${activationCount === 1 ? "time" : "times"}`}</span>
              </div>
            </div>
          )}

          {mode === "feedback" && (
            <div className={lab.demoContent}>
              <div>
                <h3>Pending is only the middle.</h3>
                <p>The first simulated request fails on purpose. Retry to complete the flow. Nothing is saved or sent.</p>
              </div>
              <div className={lab.actionRow}>
                <Button size="lg" loading={feedback === "pending"} loadingLabel="Saving changes" onClick={startAction}>
                  {feedback === "error" ? "Retry save" : feedback === "success" ? "Save again" : "Save changes"}
                </Button>
                <span className={lab.simulationLabel}>Simulated interaction</span>
              </div>
              <p className={`${lab.feedbackStatus} ${feedback === "error" ? lab.error : feedback === "success" ? lab.success : ""}`} role="status" aria-live="polite">
                {feedback === "pending" ? "Saving… this takes a moment." : feedback === "error" ? "The simulated save failed. Try again to finish." : feedback === "success" ? "Saved in this demonstration." : "Ready to demonstrate a save."}
              </p>
            </div>
          )}

          {mode === "keyboard" && (
            <div className={lab.demoContent}>
              <div>
                <h3>Keep the keyboard in the flow.</h3>
                <p>Open the destination picker. Type to find an option, press Escape to close, and focus returns to the trigger.</p>
              </div>
              <div className={lab.selectDemo}>
                <Select value={destination} onValueChange={(value) => setDestination(value ?? "dashboard")} items={{ dashboard: "Project dashboard", review: "Design review", archive: "Archive" }}>
                  <SelectLabel>Move this project to</SelectLabel>
                  <SelectTrigger aria-label="Move this project to" className={lab.selectTrigger}>
                    <SelectValue placeholder="Choose a destination" />
                  </SelectTrigger>
                  <SelectContent className={themeClass} popupClassName={lab.selectPopup}>
                    <SelectItem value="dashboard">Project dashboard</SelectItem>
                    <SelectItem value="review">Design review</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                  </SelectContent>
                </Select>
                <span role="status" aria-live="polite">Current destination: {destination === "dashboard" ? "Project dashboard" : destination === "review" ? "Design review" : "Archive"}</span>
              </div>
            </div>
          )}
        </div>

        <div className={lab.labFooter}>
          <p><strong>What’s installed:</strong> Button feedback and loading state, plus Select keyboard behavior.</p>
          <p><strong>What this page adds:</strong> the selectable showcase, simulated save/retry flow, and local status messages.</p>
          <Link href={mode === "keyboard" ? "/components/select" : "/components/button"}>
            Read the {mode === "keyboard" ? "Select" : "Button"} docs <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className={lab.collection}>
        <p>Button, Input, Textarea, Label, Checkbox, Radio group, Select, Switch and Spinner.</p>
        <Link href="/components">Explore all 9 Particles <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
