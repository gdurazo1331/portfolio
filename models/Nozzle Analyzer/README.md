### Requirements and setup
- Python 3
- NumPy and Matplotlib for calculations and plotting
- VS Code with the Python and Jupyter extensions, or Jupyter Notebook
Install the Python packages in the enviornment that will run the notebook:
```bash
python -m pip install numpy matplotlib ipykernel notebook
```

### How to run
1. Extract the submission ZIP and open its folder in VS Code/
2. Open `Nozzle_Analyzer(1).ipynb`
3. Use Select Kernel to choose the Python environment containing the installed packages. The saved `.venv` kernel name refers to the original local environment; select an enviornment available on your computer.
4. Restart the kernel, then select Run All to execute the notebook from top to bottom. Part 2 uses functions and variables defined in Part 1.
5. Read the numerical results and plot below the code cells, then save the notebook.
Alternatively, launch Jupyter Notebook from the extracted folder:
```bash
jupyter notebook
```
Open the notebook in the browser and run all cells in order.
Setup documentation: [VS Code notebooks](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) and [Jupyter installation](https://jupyter.org/install).
### Analysis and outputs
- Part 1: nozzle geometry; Mach, static pressure, and static temperature distributions; mass flow; exit velocity; vacuum thrust and specific impulse.
- Part 2: ideal isentropic baseline; predicted versus measured Pitot pressure; embedded-shock strength and location; downstream exit conditions; mass-conservation check; sea-level and vacuum thrust and specific-impulse comparisons.

### Assumptions and interpretation
The model assumes steady, quasi-one-dimensional, axisymmetric flow of a calorically perfect gas. Flow is isentropic within each region, with a single adiabatic normal shock in the shoc-contaning model. Calculations use SI units. Part 1 uses contour-derived areas; Part 2 uses the explicitly assigned exit area of 23.256 m^2.

Part 2's sea-level and vacuum performance comparisons hold each calculated exit state fixed while changing ambient pressure in the thrust equation. These are formal comparisons. Changing the actual back pressure can change the internal flow and shock postion. The unusually high formal vacuum specific impulse for the shock-containing state doe snot establish improved physical vacuum performance. See the PDF report for interpretation.

### Numerical checkpoints
Approximate results for the supplied inputs: 
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="border-bottom: 2px solid #ccc;">
      <th style="text-align: left; padding: 8px 0;">Quantity</th>
      <th style="text-align: right; padding: 8px 0;">Expected value</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="text-align: left; padding: 8px 0;">Part 1 exit Mach</td>
      <td style="text-align: right; padding: 8px 0;">4.70672</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="text-align: left; padding: 8px 0;">Part 2 Mach immediately before the shock</td>
      <td style="text-align: right; padding: 8px 0;">4.14577</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="text-align: left; padding: 8px 0;">Part 2 shock position from the contour's x = 0</td>
      <td style="text-align: right; padding: 8px 0;">3.8768 m</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="text-align: left; padding: 8px 0;">Part 2 throat and exit mass flow</td>
      <td style="text-align: right; padding: 8px 0;">226.750353 kg/s</td>
    </tr>
  </tbody>
</table>

The mass-flow difference shoul dbe close to numerical roundoff. A `NameError` usually indicates skipped cells; restart the kernel and run all cells. A missing-package error indicates that the package must be installed in the selected kernel's Python environment