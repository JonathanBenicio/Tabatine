
function benchmark() {
  const sizes = [10, 100, 1000, 10000];
  const iterations = 10000;

  console.log(`| Array Size | Array.find (ms) | Map.get (ms) | Improvement |`);
  console.log(`|------------|-----------------|--------------|-------------|`);

  sizes.forEach(size => {
    const data = Array.from({ length: size }, (_, i) => ({ id_nf: i, name: `NF ${i}` }));
    const map = new Map(data.map(item => [item.id_nf.toString(), item]));
    const targetId = (size - 1).toString();

    // Baseline: Array.find
    const startArray = performance.now();
    for (let i = 0; i < iterations; i++) {
      data.find(n => n.id_nf.toString() === targetId);
    }
    const endArray = performance.now();
    const arrayTime = endArray - startArray;

    // Optimized: Map.get
    const startMap = performance.now();
    for (let i = 0; i < iterations; i++) {
      map.get(targetId);
    }
    const endMap = performance.now();
    const mapTime = endMap - startMap;

    const improvement = ((arrayTime - mapTime) / arrayTime * 100).toFixed(2);
    console.log(`| ${size.toString().padEnd(10)} | ${arrayTime.toFixed(4).padEnd(15)} | ${mapTime.toFixed(4).padEnd(12)} | ${improvement}% |`);
  });
}

benchmark();
