export default function Parenthetical({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mt-6 max-w-xs text-center mx-auto mb-8">
      <span className="box-decoration-break-clone bg-mvmnt-yellow text-sm text-[#a8a0a1] before:content-['('] after:content-[')'] px-2 py-1 before:mr-1 after:ml-1">
        {children}
      </span>
      <style>
        {`.box-decoration-break-clone {
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }`}
      </style>
    </div>
  )
}