# Dimensions

Many benchmarks focus on measuring a single aspect of performance, elasped time
running a code sample.  However, performance is often about making tradeoffs, making
benchmarking a multi-dimensional problem.

ABR uses a "Dimension" object to define a measurable aspect of the code under test,
where measurements taken can be directly compared.

# Custom Dimensions

Some factors with significant impact on performance are difficult to measure.
Some factors can have a significant impact on the stability and meaning of a
benchmark.  For example, benchmarking code that uses a network interface introduces
an order of magnatude of complexity into the benchmarking process.  It is difficult
to create a benchmark for the purpose of CI that uses an uncertain network.  The
performance of the network might not be the aspect of performance that the 
benchmark is attempting to measure.

One way to overcome this is to use a mock version of a sub-system with these
characteristics and have instrument the mock to produce custom metrics.  These
metrics can be fed to an ABR Dimension definition if they are useful to measure.

For example, code that is heavily reliant on the filesystem can be
benchmarked against a virtual file system that operates out of memory, but that might 
track metrics such as blocks read or files opened.  These can be captured in ABR via 
a custom dimension, allowing CI to fail if a dimension changes in a significant way.
This does not give a true end-to-end acceptance test level understanding of
performance, but might help to catch regressions in particular areas of code.