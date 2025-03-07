import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
        <img src="https://i.postimg.cc/ncrMHYMZ/Group-3-6-2.png" style={{height: 40}} />
        </div>
        
      </nav>

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-12 max-w-7xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight text-black">
          Hey, I&apos;m Tim — a Web3 developer 👋
          </h1>
          <p className="text-gray-600 text-lg">
          I used to be a professional breakdancer and am now building and designing AI and blockchain projects.
          </p>
          <div className=" items-center gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/breakdance">
                <button className="border-2 border-gray-400 items-center flex flex-col justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-700 bg-white h-32 px-6 py-3 rounded-xl w-full transition duration-300">
                    <Image
                    src="https://i.postimg.cc/GtZM2wZ3/2zjj-T3-Logo-Makr.png"
                    width={30}
                    height={30}
                    alt="Breakdance"
                    className=" mb-2"
                    />
                <p>Breakdance</p>
                </button>
              </Link>
              
              <Link href="https://cosmic-shaker-77f.notion.site/Most-interesting-people-16872fe9ba6a80efad60ed7e05f4ffea">
                <button className="border-2 border-gray-400 items-center flex flex-col justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-700 bg-white h-32 px-6 py-3 rounded-xl w-full transition duration-300">
                      <Image
                      src="https://i.postimg.cc/RZjnDCwZ/14et-F4-Logo-Makr.png"
                      width={30}
                      height={30}
                      alt="Breakdance"
                      className=" mb-2"
                      />
                  <p>Most Interesting People</p>
                </button>
              </Link>
              
              <Link href="https://www.goodreads.com/user/show/94715758-tim-babnik">
                <button className="border-2 border-gray-400 items-center flex flex-col justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-700 bg-white h-32 px-6 py-3 rounded-xl w-full transition duration-300">
                    <Image
                    src="https://i.postimg.cc/63zqtB4R/5u5-Ley-Logo-Makr.png"
                    width={30}
                    height={30}
                    alt="Breakdance"
                    className=" mb-2"
                    />
                <p>What I am currently reading</p>
                </button>
              </Link>
              
              <a href="mailto:tim.babnik16@gmail.com">
                <button className="border-2 border-gray-400 items-center flex flex-col justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-700 bg-white h-32 px-6 py-3 rounded-xl w-full transition duration-300">
                    <Image
                    src="https://i.postimg.cc/J727q6N1/75-Bjco-Logo-Makr.png"
                    width={30}
                    height={30}
                    alt="Breakdance"
                    className=" mb-2"
                    />
                <p>Contact me</p>
                </button>
              </a>
            </div>
            
          </div>
        </div>
        <div className="relative h-[500px]">
          <Image
            src="https://i.postimg.cc/50v537yj/Screenshot-2025-02-17-at-15-47-16.png"
            fill
            className="object-cover rounded-2xl"
            alt="Profile"
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Flop App Project */}
          <a href="https://www.dnamusic.xyz" target="_blank">
            <div className="relative group bg-[#7C3AED] rounded-3xl overflow-hidden cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="https://i.postimg.cc/tTqd2mNR/Screenshot-2025-02-17-at-13-54-10.png"
                  fill
                  className="object-cover"
                  alt="Flop App"
                />
              </div>
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <div className="text-white space-y-2">
                  <h3 className="text-2xl font-bold">DNA Music</h3>
                  <p className="text-white/80">Friend.tech for music - collect an artist&apos;s key, giving you access to their music for free, the chance to name their next song, and the opportunity to profit from the key’s value. The price of the key follows a bonding curve, meaning as the artist becomes more popular, you can sell the key and make a profit.</p>
                  <p className='border-t'>Next.jst / Solidity / Figma</p>
                </div>
              </div>
            </div>
          </a>

          {/* Lendscape Project */}
          <a href="https://github.com/timbabnik/web3publishing" target="_blank">
            <div className="relative group bg-[#1F2937] rounded-3xl overflow-hidden cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="https://i.postimg.cc/xCZwQHCm/Screenshot-2025-02-17-at-14-01-46.png"
                  fill
                  className="object-cover"
                  alt="Lendscape"
                />
              </div>
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <div className="text-white space-y-2">
                  <h3 className="text-2xl font-bold">Alwrite</h3>
                  <p className="text-white/80">Web3 Substack where you can collect writers posts. Similar to Mirror.xyz and Paragraph.xyz with new features like joining writers creative group.</p>
                  <p className='border-t'>React.js / Firebase / Tailwind CSS / Solidity</p>
                </div>
              </div>
            </div>
          </a>

          {/* DeFi Exchange Project */}
          <Link href="/project">
            <div className="relative group bg-[#2563EB] rounded-3xl overflow-hidden cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="https://i.postimg.cc/VLh3p2vN/Screenshot-2022-11-15-at-15-48-25-2048x1218.png"
                  fill
                  className="object-cover"
                  alt="DeFi Exchange"
                />
              </div>
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <div className="text-white space-y-2">
                  <h3 className="text-2xl font-bold">Portfolio</h3>
                  <p className="text-white/80">Check out my projects that I&apos;ve worked on</p>
                  <p className='border-t'>Next.js / Tailwind CSS / Figma / React.js / Solidity / Firebase / Ethers.js / Hardhat / Node.js / Express.js / MongoDB</p>
                </div>
              </div>
            </div> 
          </Link>

          {/* NFT Marketplace Project */}
          <a href="https://github.com/timbabnik/consulting" target="_blank">
            <div className="relative group bg-[#DC2626] rounded-3xl overflow-hidden cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src="https://i.postimg.cc/2yrzqMhY/Screenshot-2025-02-17-at-14-14-50.png"
                  fill
                  className="object-cover"
                  alt="NFT Marketplace"
                />
              </div>
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <div className="text-white space-y-2">
                  <h3 className="text-2xl font-bold">Consulting platform</h3>
                  <p className="text-white/80">Random project I designed and developed where you can pay consultants in crypto</p>
                  <p className="border-t">Next.js / Ethers.js / Hardhat / Solidity / Firebase</p>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
