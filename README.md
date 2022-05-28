**An assessment extension for Sphinx (and Jupyter Book).**

This package contains a Sphinx extension for producing assessment directives: multiple choice, drag-and-drop, fill-in-the-blank, Parsons problems.

**This is an alpha-version, use at your own risk; interfaces may change**

## Get started

To get started with *sphinx_assessment*, first install it through pip:

```
pip install git+https://github.com/eelcodijkstra/sphinx-assessment.git
```

### Use in Jupyter Book

Add *sphinx_assessment* to the sphinx extensions in `_config.yml`:

```
sphinx:
  extra_extensions:
    - sphinx_assessment
```

### Use in Sphinx

Add *sphinx_assessment* to your sphinx extensions in `conf.py`

```
extensions = ["sphinx_assessment"]
```

## Documentation

TBD.

## Aknowledgements

This extension has been inspired by the Runestone Interactive extensions.
