import { cn } from "@/lib/utils"

const TextHeading = ({title, className}:{title:string, className?:string}) =>{
    const baseStyles = "text-[24px] sm:text-d2 font-[700] text-gradient-headings"
    return (
        <h1 className={cn(baseStyles, className)}>{title}</h1>
    )
}

export default TextHeading;