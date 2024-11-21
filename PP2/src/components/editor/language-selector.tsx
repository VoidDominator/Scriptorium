import * as React from "react"
import { PopoverProps } from "@radix-ui/react-popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { useMutationObserver } from "@/hooks/use-mutation-observer"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

import { Language, LanguageType } from "./data/languages"

interface LanguageSelectorProps extends PopoverProps {
  types: readonly LanguageType[]
  languages: Language[]
}

export function LanguageSelector({ languages, types, ...props }: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedLanguage, setSelectedLanguage] = React.useState<Language>(languages[0])
  const [peekedLanguage, setPeekedLanguage] = React.useState<Language>(languages[0])

  return (
    <div className="grid gap-2">
      <HoverCard openDelay={200}>
        {/* <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Select from over 15 languages to code in.
        </HoverCardContent> */}
        <HoverCardTrigger asChild>
          <Label htmlFor="language">Language</Label>
        </HoverCardTrigger>
      </HoverCard>
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a language"
            className="w-full justify-between"
          >
            {selectedLanguage ? selectedLanguage.name : "Select a language..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[250px] p-0">
          <HoverCard>
            <HoverCardContent
              side="left"
              align="start"
              forceMount
              className="min-h-[280px]"
            >
              <div className="grid gap-2">
                <h4 className="font-medium leading-none">{peekedLanguage.name}</h4>
                <div className="text-sm text-muted-foreground">
                  {peekedLanguage.description}
                </div>
                {peekedLanguage.strengths ? (
                  <div className="mt-4 grid gap-2">
                    <h5 className="text-sm font-medium leading-none">
                      Strengths
                    </h5>
                    <ul className="text-sm text-muted-foreground">
                      {peekedLanguage.strengths}
                    </ul>
                  </div>
                ) : null}
              </div>
            </HoverCardContent>
            <Command loop>
              <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
                <CommandInput placeholder="Search Languages..." />
                <CommandEmpty>No Languages found.</CommandEmpty>
                <HoverCardTrigger />
                {types.map((type) => (
                  <CommandGroup key={type} heading={type}>
                    {languages
                      .filter((language) => language.type === type)
                      .map((language) => (
                        <LanguageItem
                          key={language.id}
                          language={language}
                          isSelected={selectedLanguage?.id === language.id}
                          onPeek={(language) => setPeekedLanguage(language)}
                          onSelect={() => {
                            setSelectedLanguage(language)
                            setOpen(false)
                          }}
                        />
                      ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </HoverCard>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface LanguageItemProps {
  language: Language
  isSelected: boolean
  onSelect: () => void
  onPeek: (language: Language) => void
}

function LanguageItem({ language, isSelected, onSelect, onPeek }: LanguageItemProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  useMutationObserver(ref, (mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected" &&
        ref.current?.getAttribute("aria-selected") === "true"
      ) {
        onPeek(language)
      }
    })
  })

  return (
    <CommandItem
      key={language.id}
      onSelect={onSelect}
      ref={ref}
      className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
    >
      {language.name}
      <Check
        className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  )
}