import { useEffect, useState } from "react"
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea
} from "@heroui/react"
import { Trash2 } from "lucide-react"
import type { Review } from "@/features/reviews"
import { Sentiment, useDeleteReview, useUpdateReview } from "@/features/reviews"

interface ReviewModalProps {
  review: Review | null
  isOpen: boolean
  onClose: () => void
}

export default function ReviewModal({
  review,
  isOpen,
  onClose
}: ReviewModalProps) {
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()

  const [sentiment, setSentiment] = useState<Sentiment | "">("")

  useEffect(() => {
    if (review) {
      setSentiment(review.sentiment)
    }
  }, [review])

  const handleSave = async () => {
    if (!review || !sentiment) return

    await updateReview.mutateAsync({
      id: review.id,
      update: { sentiment: sentiment }
    })
    onClose()
  }

  const handleDelete = async () => {
    if (!review) return

    await deleteReview.mutateAsync({
      id: review.id,
      analysisId: review.analysis_id
    })
    onClose()
  }

  if (!review) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 mr-8">
                <span className="truncate">Отзыв {review.source_id}</span>
                <Chip size="sm" variant="flat">
                  Уверенность: {(review.confidence * 100).toFixed(1)}%
                </Chip>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Textarea
                  label="Текст отзыва"
                  value={review.text}
                  isReadOnly
                  minRows={3}
                  maxRows={10}
                />

                <Select
                  label="Тональность"
                  selectedKeys={sentiment ? [sentiment] : []}
                  onSelectionChange={(keys) =>
                    setSentiment(Array.from(keys)[0] as Sentiment)
                  }
                  disallowEmptySelection
                >
                  <SelectItem key={Sentiment.Positive}>Позитивный</SelectItem>
                  <SelectItem key={Sentiment.Neutral}>Нейтральный</SelectItem>
                  <SelectItem key={Sentiment.Negative}>Негативный</SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Button
                color="danger"
                variant="flat"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleDelete}
                isLoading={deleteReview.isPending}
              >
                Удалить
              </Button>
              <div className="flex gap-2">
                <Button variant="light" onPress={close}>
                  Отмена
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isLoading={updateReview.isPending}
                >
                  Сохранить
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
