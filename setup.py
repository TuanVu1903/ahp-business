from setuptools import setup, find_packages

setup(
    name="ahp-business",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "Flask==2.0.1",
        "pandas==1.5.3",
        "numpy==1.24.3",
        "gunicorn==20.1.0",
        "pymongo==4.3.3",
        "python-dotenv==0.19.0",
        "Werkzeug==2.0.1",
        "itsdangerous==2.0.1",
        "Jinja2==3.0.1",
        "MarkupSafe==2.0.1",
        "click==8.0.1",
        "requests==2.31.0",
        "python-docx==1.1.0",
        "XlsxWriter==3.1.9",
        "reportlab==4.0.9",
        "Pillow==10.2.0",
    ],
    python_requires=">=3.10.9,<3.11",
) 