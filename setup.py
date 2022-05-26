from setuptools import setup, find_packages

setup(
    name='sphinx_assessment',
    version='0.1.0',
    description='Assessment questions for Jupyter Book',
    author='Eelco Dijkstra',
    author_email='eelco@infvo.nl',     
    packages=find_packages(include=['sphinx_assessment', 'sphinx_assessment.*'])
)