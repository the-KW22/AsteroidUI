"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectExample() {
  const [controlledValue, setControlledValue] = React.useState("pear");

  return (
    <section aria-label="Select examples" className="grid max-w-sm gap-6">
      <div>
        <Select
          name="fruit"
          defaultValue="apple"
          items={{
            apple: "Apple",
            pear: "Pear",
            orange: "Orange",
            banana: "Banana",
            mango: "Mango",
            peach: "Peach",
            plum: "Plum",
            watermelon: "Watermelon",
            long: "A very long fruit option that must remain inside the available viewport width",
          }}
        >
          <SelectLabel>Favorite fruit</SelectLabel>
          <SelectTrigger aria-label="Favorite fruit">
            <SelectValue placeholder="Choose a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
            <SelectItem value="peach">Peach</SelectItem>
            <SelectItem value="plum">Plum</SelectItem>
            <SelectItem value="watermelon">Watermelon</SelectItem>
            <SelectItem value="long">A very long fruit option that must remain inside the available viewport width</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <form>
          <Select
            name="controlledFruit"
            value={controlledValue}
            onValueChange={(value) => setControlledValue(value ?? "")}
            items={{ pear: "Pear", orange: "Orange", grape: "Grape" }}
          >
            <SelectLabel>Controlled fruit</SelectLabel>
            <SelectTrigger
              aria-label="Controlled fruit"
              className={(state) => state.open ? "callback-open" : "callback-closed"}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pear">Pear</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
            </SelectContent>
          </Select>
          <output aria-label="Controlled value">{controlledValue}</output>
        </form>
      </div>

      <div className="grid gap-2">
        <Select disabled items={{ one: "One", two: "Two" }}>
          <SelectLabel>Disabled select</SelectLabel>
          <SelectTrigger aria-label="Disabled select">
            <SelectValue placeholder="Unavailable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one">One</SelectItem>
            <SelectItem value="two">Two</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Select defaultValue="available" items={{ available: "Available", unavailable: "Unavailable" }}>
          <SelectLabel>Disabled option</SelectLabel>
          <SelectTrigger aria-label="Disabled option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable" disabled>Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
