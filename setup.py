from setuptools import setup, find_packages

setup(
    name='sphinx_assessment',
    version='0.1.1',
    description='Assessment questions for Jupyter Book',
    author='Eelco Dijkstra',
    author_email='eelco@infvo.nl',
    url='https://github.com/eelcodijkstra/sphinx-assessment',
    packages=find_packages(include=['sphinx_assessment', 'sphinx_assessment.*']),
    include_package_data=True,
    license="MIT"
)