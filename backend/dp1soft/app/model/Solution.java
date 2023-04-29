/*
    Solution.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.model;

import java.util.ArrayList;

//Es el modelo para una solución o ruta de un vehículo
public class Solution implements Comparable<Solution>{

    //region Constantes
    private static final double W_COST = 0.5;
    private static final int W_LATE = Integer.MAX_VALUE;
    private static final double W_CYOVER = 10000;
    private static final double W_EXCESS = 10;
    //endregion

    //region Parámetros Auxiliares
    public static ArrayList<Vehicle> vehicles = null;
    public static int currentTime = -1;
    public static Pack pack = null;
    //endregion

    //region Atributos
    //Lista de cromosomas en orden, instrucciones que se seguirán
    private ArrayList<Chrom> chroms;
    //Índice en el arreglo de vehículos
    private int iVehicle;
    private boolean isLate;
    //endregion

    //region Getters/Setters
    public ArrayList<Chrom> getChroms() {
        return chroms;
    }

    public void setChroms(ArrayList<Chrom> chroms) {
        this.chroms = chroms;
    }

    public int getiVehicle() {
        return iVehicle;
    }

    public void setiVehicle(int iVehicle) {
        this.iVehicle = iVehicle;
    }

    public boolean isLate() {
        return isLate;
    }

    public void setLate(boolean late) {
        isLate = late;
    }
    //endregion

    //region Constructores
    public Solution(){
        this.chroms = new ArrayList<>();
    }
    //endregion

    //region Métodos
    public boolean isBetter(Solution s){
        return this.fitness() < s.fitness();
    }
    private double fitness() {
        Vehicle v = vehicles.get(this.iVehicle);
        double cost = v.getCost() * this.chroms.size();
        double time = this.chroms.size() / v.getSpeed() * 60;
        int late = 0;
        int overtime = 0;
        if((currentTime + time)/480 != vehicles.get(this.iVehicle).getTurn()){
            overtime = (int)(currentTime + time) % 480;
        }
        if(pack.getDeadline() < currentTime + time){
            late = 1;
            this.isLate = true;
        }
        int carryOver = Integer.max(pack.getUnassigned() - v.getCarry(), 0);
        int excess = Integer.max(v.getCarry() - pack.getUnassigned(), 0);
        return cost * W_COST + late * W_LATE + carryOver * W_CYOVER + excess * W_EXCESS + overtime * W_COST * 5;
    }
    @Override
    public int compareTo(Solution solution) {
        //  Ascendente
        return (int)(this.fitness() - solution.fitness());
        //  Descendente
        // return (int)(solution.fitness() - this.fitness());
    }
    //endregion
}