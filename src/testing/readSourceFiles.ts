// Test-only helper for static checks over the repo's source. The project has no Node
// types, so the few fs/path calls used here are typed locally.
interface FsLike {
  readdirSync(path: string): string[]
  readFileSync(path: string, encoding: 'utf8'): string
  statSync(path: string): { isDirectory(): boolean }
}

interface PathLike {
  join(...parts: string[]): string
  relative(from: string, to: string): string
}

export interface SourceFile {
  /** Path relative to the repo root, with forward slashes. */
  path: string
  content: string
}

const fs = jest.requireActual<FsLike>('fs')
const path = jest.requireActual<PathLike>('path')

const repoRoot = path.join(jest.requireActual<{ cwd(): string }>('process').cwd())

/** Every .ts/.tsx file under the given repo-relative directories (tests included). */
export function readSourceFiles(...dirs: string[]): SourceFile[] {
  return dirs.flatMap((dir) => walk(path.join(repoRoot, dir))).map((file) => ({
    path: path.relative(repoRoot, file).split('\\').join('/'),
    content: fs.readFileSync(file, 'utf8'),
  }))
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) return walk(full)
    return /\.tsx?$/.test(name) ? [full] : []
  })
}
