import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@heroui/react"
import { Trash2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useDeleteAnalysis } from "@/features/analyses"

interface DeleteAnalysisProps {
  analysisId: number
  filename: string
}

export default function DeleteAnalysis({
  analysisId,
  filename
}: DeleteAnalysisProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const deleteMutation = useDeleteAnalysis()
  const navigate = useNavigate()

  const handleDelete = () => {
    deleteMutation.mutate(analysisId, {
      onSuccess: () => {
        navigate({ to: "/" })
      }
    })
  }

  return (
    <>
      <Button
        color="danger"
        variant="light"
        startContent={<Trash2 className="w-4 h-4" />}
        onPress={onOpen}
        className="shrink-0"
      >
        Удалить
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Удаление анализа
              </ModalHeader>
              <ModalBody>
                <p className="text-balance">
                  Вы уверены, что хотите удалить анализ <b>{filename}</b>? Это
                  действие нельзя будет отменить.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={deleteMutation.isPending}
                >
                  Удалить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
