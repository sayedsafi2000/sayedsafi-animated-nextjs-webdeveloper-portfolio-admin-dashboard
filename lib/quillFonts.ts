// Quill Font Registration Module
// This must be imported before ReactQuill to register custom fonts

// Bangla, English & Default fonts
export const CUSTOM_FONTS: string[] = [
  'sans-serif',         // Sans Serif (default)
  'serif',              // Serif
  'monospace',          // Monospace
  'noto-sans-bengali',  // নোটো সান্স বাংলা (Bangla)
  'roboto',             // Roboto (English)
  'poppins',            // Poppins (English)
  'open-sans',          // Open Sans (English)
  'lato',               // Lato (English)
  'lexend',             // Lexend (English)
  'arial',              // Arial (English)
  'times-new-roman'     // Times New Roman (English)
]

let fontsRegistered = false

export const registerQuillFonts = async (): Promise<boolean> => {
  if (fontsRegistered || typeof window === 'undefined') {
    return fontsRegistered
  }

  try {
    // Import Quill
    const QuillModule = await import('quill')
    const Quill = QuillModule.default

    if (!Quill || !Quill.import) {
      console.warn('Quill not available')
      return false
    }

    // Try to get Font from attributors/style/font (Quill v2 path)
    let Font = null
    try {
      Font = Quill.import('attributors/style/font') as any
      console.log('✅ Found font at attributors/style/font')
    } catch (e) {
      // Fallback to formats/font (Quill v1 path)
      try {
        Font = Quill.import('formats/font') as any
        console.log('✅ Found font at formats/font')
      } catch (e2) {
        console.error('❌ Font format not found in Quill')
        return false
      }
    }

    if (!Font) {
      console.error('❌ Font is null')
      return false
    }

    // Set the whitelist property with only sans-serif
    Font.whitelist = CUSTOM_FONTS

    // Re-register the Font format with updated whitelist
    Quill.register(Font, true)

    fontsRegistered = true
    console.log('✅ Quill fonts registered successfully!')
    console.log('Font whitelist:', Font.whitelist)
    
    return true
  } catch (error) {
    console.error('❌ Error registering Quill fonts:', error)
    return false
  }
}

// Synchronous registration if Quill is already available
export const registerQuillFontsSync = (): boolean => {
  if (fontsRegistered || typeof window === 'undefined') {
    return fontsRegistered
  }

  try {
    const Quill = (window as any).Quill
    if (!Quill || !Quill.import) {
      return false
    }

    let Font = null
    try {
      Font = Quill.import('attributors/style/font') as any
    } catch (e) {
      try {
        Font = Quill.import('formats/font') as any
      } catch (e2) {
        return false
      }
    }

    if (!Font) {
      return false
    }

    Font.whitelist = CUSTOM_FONTS
    Quill.register(Font, true)
    fontsRegistered = true
    console.log('✅ Quill fonts registered synchronously!')
    return true
  } catch (error) {
    return false
  }
}

// Try to register fonts immediately if Quill is already loaded
if (typeof window !== 'undefined') {
  registerQuillFontsSync()
  
  // Also try after delays
  setTimeout(registerQuillFontsSync, 50)
  setTimeout(registerQuillFontsSync, 100)
  setTimeout(registerQuillFontsSync, 200)
  setTimeout(registerQuillFontsSync, 500)
}
