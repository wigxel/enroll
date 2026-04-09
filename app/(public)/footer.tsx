export function Footer() {
  return (
    <footer className="py-4 z-0 relative">
      <div className="container flex relative z-20 items-center mx-auto text-muted-foreground text-sm justify-between">
        <span className="text-xs py-4 border border-primary/10 fixed bottom-0 bg-red-200 rounded-t-2xl  px-4">
          <span className="">
            Powered by{" "}
            <a
              href="https://wigxel.io"
              target="_blank"
              className="hover:underline"
              rel="noopener"
            >
              Wigxel <b className="text-black">Enroll</b>
            </a>
          </span>
        </span>

        <div />

        <div className="flex">
          &copy; {new Date().getFullYear()}&nbsp; All rights reserved.
        </div>
      </div>

      <div className="z-0 translate-x-1/2 blur-[45px] pointer-events-none z-10 translate-y-1/2 w-[50svh] aspect-square rounded-full bg-gradient-to-bl opacity-50 from-red-400 to-red-600 fixed bottom-0 right-0" />
    </footer>
  );
}
