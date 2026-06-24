import { Check, CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS, MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../lib/constants'

interface UploadProps {
  onComplete?: (base64Data: string, file: File) => void
}

const Upload = ({ onComplete }: UploadProps): React.JSX.Element => {

    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const { isSignedIn } = useOutletContext<AuthContext>()

    // Cleanup effect for unmount and state changes
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const validateFile = (selectedFile: File): boolean => {
        setError(null)

        // Check file size
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setError('File size exceeds 50MB limit')
            return false
        }

        // Check MIME type
        if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
            setError('Invalid file type. Only JPG and PNG are allowed')
            return false
        }

        // Check file extension
        const fileName = selectedFile.name.toLowerCase()
        const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext))
        if (!hasValidExtension) {
            setError('Invalid file extension. Only .jpg, .jpeg, and .png are allowed')
            return false
        }

        return true
    }

    const processFile = (selectedFile: File) => {
        if (!isSignedIn) return

        // Validate file before processing
        if (!validateFile(selectedFile)) {
            return
        }

        // Clear any existing timers before processing new file
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        setFile(selectedFile)
        setProgress(0)

        const reader = new FileReader()
        reader.onerror =() => {
            setFile(null)
            setProgress(0)
        }

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
                        
                        // Store the timeout handle
                        timeoutRef.current = setTimeout(() => {
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
        
        e.preventDefault()
        e.stopPropagation()
        if (!isSignedIn) return
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        
        e.preventDefault()
        e.stopPropagation()
        if (!isSignedIn) return
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
                        {error && <p className="error" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
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
