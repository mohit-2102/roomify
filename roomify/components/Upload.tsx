import { Check, CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants'

interface UploadProps {
  onComplete?: (base64Data: string, file: File) => void
}

const Upload = ({ onComplete }: UploadProps): React.JSX.Element => {

    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const { isSignedIn } = useOutletContext<AuthContext>()

    const processFile = (selectedFile: File) => {
        if (!isSignedIn) return

        setFile(selectedFile)
        setProgress(0)

        const reader = new FileReader()

        reader.onload = () => {
            const base64String = reader.result as string
            
            // Start progress interval
            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + PROGRESS_STEP
                    
                    if (newProgress >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current)
                        }
                        
                        // Call onComplete after delay
                        setTimeout(() => {
                            onComplete?.(base64String, selectedFile)
                        }, REDIRECT_DELAY_MS)
                        
                        return 100
                    }
                    
                    return newProgress
                })
            }, PROGRESS_INTERVAL_MS)
        }

        reader.readAsDataURL(selectedFile)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return
        
        const files = e.target.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isSignedIn) return
        
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isSignedIn) return
        
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }

    return (
        <div className='upload'>
            {!file ? (
                <div 
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input 
                        ref={fileInputRef}
                        type="file"
                        className='drop-input'
                        accept='.jpeg, .jpg, .png'
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? ('Drop your file here or click to upload') : ('Please sign in or signup with puter to upload files')}
                        </p>
                        <p className="help">Maximum file size 50MB.</p>
                    </div>
                </div>
            ) : (
                <div className='upload-status'>
                    <div className="status-content">
                        <div className="status-icon">

                            {progress === 100 ? (
                                <CheckCircle2 className='check' />

                            ) : (
                                <ImageIcon className='image' />
                            )}
                        </div>
                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />
                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upload
