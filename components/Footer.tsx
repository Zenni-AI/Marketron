export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blueDeep pb-24 pt-16 text-white/70 md:pb-16 md:pt-20">
      <div className="mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-10 border-b border-white/12 pb-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-white font-display text-[13px] font-bold tracking-tight text-blueDeep">
                JVS
              </span>
              <span className="font-display text-xl text-white">
                JVS Painting Inc.
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Commercial and government contract painting across New Jersey for
              over four decades.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:gap-16">
            <div>
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                Office
              </h3>
              <address className="mt-4 text-sm not-italic leading-relaxed">
                104 4th Street, Unit A
                <br />
                Riverside, NJ 08075
              </address>
            </div>
            <div>
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                Contact
              </h3>
              <p className="mt-4 text-sm leading-relaxed">
                <a
                  href="tel:+18564615888"
                  className="font-display text-lg text-white transition-colors duration-150 hover:text-red"
                >
                  856-461-5888
                </a>
              </p>
            </div>
          </div>
        </div>

        <p className="pt-8 text-xs tracking-wide text-white/45">
          &copy; {year} JVS Painting Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
