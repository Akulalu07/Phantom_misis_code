import { Input, Select, SelectItem } from "@heroui/react"
import { Search } from "lucide-react"
import type { SharedSelection } from "@heroui/system"
import { Sentiment } from "@/features/reviews/types"

interface FiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  sourceIdValue: string
  onSourceIdChange: (value: string) => void
  sentimentValue: SharedSelection
  onSentimentChange: (value: SharedSelection) => void
  sortValue: SharedSelection
  onSortChange: (value: SharedSelection) => void
}

export default function Filters({
  searchValue,
  onSearchChange,
  sourceIdValue,
  onSourceIdChange,
  sentimentValue,
  onSentimentChange,
  sortValue,
  onSortChange
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <Input
        isClearable
        className="w-full lg:max-w-[320px]"
        placeholder="Поиск по тексту..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={searchValue}
        onValueChange={onSearchChange}
      />
      <Input
        isClearable
        className="w-full lg:max-w-[200px]"
        placeholder="Источник"
        value={sourceIdValue}
        onValueChange={onSourceIdChange}
      />
      <Select
        className="w-full lg:max-w-[200px]"
        placeholder="Тональность"
        selectionMode="multiple"
        selectedKeys={sentimentValue}
        onSelectionChange={onSentimentChange}
      >
        <SelectItem key={Sentiment.Positive}>Позитивные</SelectItem>
        <SelectItem key={Sentiment.Neutral}>Нейтральные</SelectItem>
        <SelectItem key={Sentiment.Negative}>Негативные</SelectItem>
      </Select>
      <Select
        className="w-full lg:max-w-[260px]"
        placeholder="Сортировка"
        disallowEmptySelection
        selectedKeys={sortValue}
        onSelectionChange={onSortChange}
      >
        <SelectItem key="confidence-desc">Уверенность (по убыванию)</SelectItem>
        <SelectItem key="confidence-asc">
          Уверенность (по возрастанию)
        </SelectItem>
      </Select>
    </div>
  )
}
