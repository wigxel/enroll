export function Footer() {
  return (
    <footer className="py-4 z-10 relative">
      <div className="container px-4 flex relative z-20 items-center mx-auto text-sm justify-between">
        <span className="text-xs py-4 border border-primary/10 fixed bottom-0 bg-red-200 rounded-t-2xl px-4">
          <span>
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

        <div className="flex text-black font-medium">
          &copy; {new Date().getFullYear()}&nbsp; All rights reserved.
        </div>
      </div>
    </footer>
  );
}
