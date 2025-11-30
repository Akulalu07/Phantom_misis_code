import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react"
import { FileUp, Loader, Upload, X } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useMediaQuery } from "usehooks-ts"
import { cn } from "@/shared/lib/utils/tailwind"
import { useCreateAnalysis } from "@/features/analyses"

export default function Create() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isOpen, setIsOpen] = useState(false)
  const {
    mutate: createAnalysis,
    isPending,
    error,
    reset
  } = useCreateAnalysis()

  const onDrop = useCallback(
    (acceptedFiles: Array<File>) => {
      if (acceptedFiles.length > 0) {
        createAnalysis(acceptedFiles[0], {
          onSuccess: () => {
            setIsOpen(false)
          }
        })
      }
    },
    [createAnalysis]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isPending,
    accept: {
      "text/csv": [".csv"]
    }
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => reset(), 300)
    }
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottom"
      showArrow
      offset={10}
    >
      <PopoverTrigger>
        <Button
          isIconOnly={isMobile}
          color="primary"
          variant="light"
          startContent={!isMobile && <Upload className="w-5 h-5" />}
        >
          {isMobile ? <Upload className="w-5 h-5" /> : "Загрузить файл"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[320px] p-0 overflow-hidden border-2 border-dashed transition-colors duration-200",
          isDragActive ? "bg-primary-50 border-primary" : "border-transparent",
          !isDragActive && !error && "hover:bg-default-100",
          error && "bg-danger-50 border-danger hover:bg-danger-100"
        )}
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative w-full flex flex-col items-center justify-center p-8 text-center cursor-pointer outline-none",
            isPending && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />

          {isPending ? (
            <div className="flex flex-col items-center gap-3 text-default-500">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <span className="text-small font-medium">Загрузка файла...</span>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "p-3 rounded-full bg-default-100 mb-3 transition-colors",
                  isDragActive && "bg-primary-100 text-primary",
                  error && "bg-danger-100 text-danger"
                )}
              >
                {error ? (
                  <X className="w-6 h-6" />
                ) : (
                  <FileUp className="w-6 h-6" />
                )}
              </div>

              {error ? (
                <div className="text-danger space-y-1">
                  <div className="font-semibold text-small">
                    Ошибка загрузки
                  </div>
                  <div className="text-tiny opacity-80">
                    Попробуйте другой файл
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-small font-medium text-default-700">
                    {isDragActive
                      ? "Отпустите файл"
                      : "Нажмите или перетащите файл"}
                  </div>
                  <div className="text-tiny text-default-400">
                    в формате CSV
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
